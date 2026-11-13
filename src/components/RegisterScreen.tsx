import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Waiter, UserRole } from '../types';
import {
  UserPlus,
  ShieldCheck,
  Lock,
  Unlock,
  User,
  Utensils,
  Sun,
  Moon,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChefHat,
  Banknote,
  Smartphone,
  Shield,
  Phone,
  Mail,
  Sparkles,
  QrCode
} from 'lucide-react';
import { sound } from '../utils/sound';
import { LanguageSelector } from './LanguageSelector';
import {
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_CASHIER_PERMISSIONS,
  DEFAULT_WAITER_PERMISSIONS,
  DEFAULT_KITCHEN_PERMISSIONS
} from '../data/mockData';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onOpenCustomerMenu?: (tableNumber: string) => void;
}

const PRESET_AVATARS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', label: 'Cajera / Host' },
  { id: '2', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80', label: 'Gerente / Admin' },
  { id: '3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', label: 'Garzón / Barista' },
  { id: '4', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', label: 'Garzona / Sala' },
  { id: '5', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&auto=format&fit=crop&q=80', label: 'Chef Ejecutivo' },
  { id: '6', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', label: 'Sommelier / Bar' },
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onOpenCustomerMenu
}) => {
  const {
    t,
    restaurantBrand,
    themeMode,
    setThemeMode,
    addWaiter,
    loginUser
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[2].url);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    setError(null);

    // Validations
    if (!name.trim()) {
      setError('Por favor ingrese el nombre y apellido del operador.');
      sound.playBeep();
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError('El PIN de seguridad debe contener exactamente 4 dígitos numéricos.');
      sound.playBeep();
      return;
    }

    if (pin !== confirmPin) {
      setError('Los códigos PIN no coinciden. Verifíquelos con atención.');
      sound.playBeep();
      return;
    }

    const defaultPerms = role === 'admin'
      ? DEFAULT_ADMIN_PERMISSIONS
      : role === 'cashier'
      ? DEFAULT_CASHIER_PERMISSIONS
      : role === 'kitchen'
      ? DEFAULT_KITCHEN_PERMISSIONS
      : DEFAULT_WAITER_PERMISSIONS;

    const newOperator = addWaiter({
      name: name.trim(),
      role,
      pin,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@${restaurantBrand.name.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: phone.trim() || '+56 9 0000 0000',
      avatar,
      active: true,
      permissions: defaultPerms
    });

    setSuccess(true);
    sound.playSuccess();

    setTimeout(() => {
      loginUser(newOperator, pin);
    }, 500);
  };

  const getRoleInfo = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return {
          title: 'Administrador / Gerente',
          desc: 'Control total de salones, caja, catálogo, empleados y configuraciones.',
          badge: 'bg-purple-600 text-white',
          icon: <ShieldCheck className="w-4 h-4 text-purple-400" />
        };
      case 'cashier':
        return {
          title: 'Cajera Principal',
          desc: 'Apertura y cierre Z de caja, cobro de comandas y arqueo de turnos.',
          badge: 'bg-emerald-600 text-white',
          icon: <Banknote className="w-4 h-4 text-emerald-400" />
        };
      case 'waiter':
        return {
          title: 'Garzón / Salón & Barra',
          desc: 'Toma de pedidos en mesas, asignación de comensales y envío a cocina.',
          badge: 'bg-blue-600 text-white',
          icon: <Smartphone className="w-4 h-4 text-blue-400" />
        };
      case 'kitchen':
        return {
          title: 'Cocina / Jefe de Cocina KDS',
          desc: 'Monitor de comandas, marchado de platos, partidas y tiempos de pase.',
          badge: 'bg-amber-600 text-white',
          icon: <ChefHat className="w-4 h-4 text-amber-400" />
        };
      case 'manager':
        return {
          title: 'Encargado / Manager',
          desc: 'Supervisión de salones, ventas, reportes y turnos.',
          badge: 'bg-indigo-600 text-white',
          icon: <ShieldCheck className="w-4 h-4 text-indigo-400" />
        };
      case 'delivery':
      default:
        return {
          title: 'Repartidor / Delivery',
          desc: 'Gestión de entregas a domicilio y seguimiento de despachos.',
          badge: 'bg-orange-600 text-white',
          icon: <Smartphone className="w-4 h-4 text-orange-400" />
        };
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between select-none overflow-x-hidden transition-colors duration-200 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header */}
      <header className={`px-4 sm:px-6 py-2.5 sm:py-3 border-b shadow-xs ${
        isLight
          ? 'bg-slate-900 text-white border-slate-800'
          : 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20 shrink-0">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm sm:text-base tracking-wider text-white font-serif truncate">
                  {restaurantBrand.name}
                </span>
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-black text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                  ALTA
                </span>
              </div>
              <p className="text-[10px] text-indigo-200/80 font-medium truncate">
                Portal de Registro de Personal y Operadores
              </p>
            </div>
          </div>

          {/* Quick Nav & Mode */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme switcher */}
            <div className="flex items-center bg-black/30 p-0.5 rounded-xl border border-white/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => { sound.playTap(); setThemeMode(isLight ? 'vibrant-dark' : 'vibrant-light'); }}
                title="Cambiar tema"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                {isLight ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>

            <LanguageSelector variant="login" />

            <button
              onClick={() => { sound.playTap(); onNavigateToLogin(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 border ${
            isLight
              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
              : 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
          }`}>
            <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
            <span>Página Independiente de Registro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Registrar Nuevo Operador de Restaurante
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
            Cree una credencial segura para nuevo personal de sala, barra, cocina o gerencia sin exponer credenciales a la vista.
          </p>
        </div>

        {/* 2-Column Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Live Badge Preview & Role Info */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Employee Badge */}
            <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col items-center text-center transition-all ${
              isLight
                ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
            }`}>
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
                {restaurantBrand.name} • Credencial de Operador
              </span>

              {/* Avatar */}
              <div className="relative mb-3">
                <img
                  src={avatar}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-md">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {name.trim() || 'Nombre del Operador'}
              </h3>

              <div className="mt-1">
                <span className={`text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${getRoleInfo(role).badge}`}>
                  {getRoleInfo(role).icon}
                  <span>{getRoleInfo(role).title}</span>
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 w-full text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[220px]">{email || 'correo@restaurante.com'}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{phone || '+56 9 0000 0000'}</span>
                </div>
              </div>

              <div className="mt-4 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Acceso Protegido por PIN Cifrado</span>
              </div>
            </div>

            {/* Quick Link to Customer Digital Menu */}
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-slate-900 dark:text-slate-100">¿Ver Carta QR de Clientes?</div>
                  <div className="text-[11px] text-slate-500">Pruebe cómo ven el menú los comensales.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  if (onOpenCustomerMenu) {
                    onOpenCustomerMenu('1');
                  } else {
                    window.location.search = '?mode=customer&table=1';
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shrink-0 cursor-pointer shadow-xs"
              >
                Abrir Carta
              </button>
            </div>
          </div>

          {/* RIGHT: Registration Form */}
          <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Operator Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nombre y Apellidos del Operador *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Rodrigo Morales"
                    className={`w-full px-3.5 py-2.5 pl-10 rounded-xl border text-sm font-bold outline-none transition-all ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Role Selector (4 Functional Roles) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Rol y Privilegios en el Restaurante *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['waiter', 'cashier', 'kitchen', 'admin'] as UserRole[]).map(r => {
                    const info = getRoleInfo(r);
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { sound.playTap(); setRole(r); }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 ring-2 ring-indigo-400/50 shadow-md'
                            : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs">{info.title.split('/')[0]}</span>
                          {info.icon}
                        </div>
                        <p className={`text-[10px] leading-tight line-clamp-2 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {info.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4-Digit Secret PIN and Confirmation (Masked, No Credentials Visible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Código PIN (4 Dígitos) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPin ? 'Ocultar' : 'Ver'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className={`w-full px-3.5 py-2.5 pl-10 rounded-xl border text-sm font-mono tracking-widest font-black outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar PIN *
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className={`w-full px-3.5 py-2.5 pl-10 rounded-xl border text-sm font-mono tracking-widest font-black outline-none transition-all ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="operador@dypos.com"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono Móvil (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Foto de Perfil Profesional
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {PRESET_AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => { sound.playTap(); setAvatar(av.url); }}
                      className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-all cursor-pointer shrink-0 ${
                        avatar === av.url
                          ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-400'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Box */}
              {success && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>¡Operador registrado con éxito! Iniciando sesión...</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={success}
                  className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-md shadow-indigo-600/30 transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrar y Acceder al Sistema</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playTap(); onNavigateToLogin(); }}
                  className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`px-4 py-3 text-center text-xs border-t ${
        isLight
          ? 'text-slate-500 bg-white border-slate-200'
          : 'text-slate-400 bg-slate-950 border-slate-800'
      }`}>
        <span className="font-semibold">{restaurantBrand.name}</span> • Sistema Dy Pos TPV Gastronómico Multi-Rol
      </footer>
    </div>
  );
};
