import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Waiter, UserRole } from '../../types';
import { mapCustomRoleToUserPermissions } from '../../data/defaultConfigs';
import { getRoleMetadata } from '../../utils/permissions';
import { sound } from '../../utils/sound';
import { Download, Plus, Search, Users, Edit2, Trash2, Check, X, ShieldCheck } from 'lucide-react';

export const UsersDirectoryManager: React.FC = () => {
  const {
    waiters,
    addWaiter,
    updateWaiter,
    deleteWaiter,
    customRoles,
    waiter: currentAuthUser,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [form, setForm] = useState<{
    name: string;
    username: string;
    email: string;
    phone: string;
    pin: string;
    customRoleId: string;
    active: boolean;
    avatar: string;
  }>({
    name: '',
    username: '',
    email: '',
    phone: '',
    pin: '',
    customRoleId: customRoles[0]?.id || 'role-waiter',
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const filteredUsers = waiters.filter(u => {
    const isActive = u.active !== false;
    if (!showInactive && !isActive) return false;

    const matchSearch =
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(search.toLowerCase());

    const roleObj = customRoles.find(r => r.id === u.customRoleId || r.baseRole === u.role);
    const matchRole = roleFilter === 'all' || roleObj?.id === roleFilter || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const selectedUser = waiters.find(u => u.id === selectedUserId) || null;

  const getRoleDisplayName = (u: Waiter) => {
    const custom = customRoles.find(r => r.id === u.customRoleId);
    if (custom) return custom.name;
    return getRoleMetadata(u.role).shortLabel.toLowerCase();
  };

  const handleOpenNew = () => {
    sound.playTap();
    const defaultRole = customRoles.find(r => r.baseRole === 'waiter') || customRoles[0];
    setEditingUserId(null);
    setForm({
      name: '',
      username: '',
      email: '',
      phone: '',
      pin: '1234',
      customRoleId: defaultRole?.id || 'role-waiter',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: Waiter) => {
    sound.playTap();
    const matchedCustom = customRoles.find(r => r.id === u.customRoleId || r.baseRole === u.role) || customRoles[0];
    setEditingUserId(u.id);
    setForm({
      name: u.name,
      username: u.username || u.email || u.name.toLowerCase().replace(/\s+/g, '.'),
      email: u.email || '',
      phone: u.phone || '',
      pin: u.pin,
      customRoleId: matchedCustom?.id || 'role-waiter',
      active: u.active !== false,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.pin.trim()) return;
    sound.playTap();

    const selectedRole = customRoles.find(r => r.id === form.customRoleId) || customRoles[0];
    const baseRole: UserRole = selectedRole?.baseRole || 'waiter';
    const mappedPermissions = selectedRole ? mapCustomRoleToUserPermissions(selectedRole) : undefined;

    if (editingUserId) {
      updateWaiter(editingUserId, {
        name: form.name.trim(),
        username: form.username.trim() || form.email.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        pin: form.pin.trim(),
        role: baseRole,
        customRoleId: selectedRole?.id,
        active: form.active,
        avatar: form.avatar,
        permissions: mappedPermissions,
      });
    } else {
      const created = addWaiter({
        name: form.name.trim(),
        username: form.username.trim() || form.email.trim() || form.name.toLowerCase().replace(/\s+/g, '.'),
        email: form.email.trim(),
        phone: form.phone.trim(),
        pin: form.pin.trim(),
        role: baseRole,
        customRoleId: selectedRole?.id,
        active: form.active,
        avatar: form.avatar,
        permissions: mappedPermissions,
      });
      setSelectedUserId(created.id);
    }

    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    sound.playTap();
    const header = ['Usuario', 'Rol', 'Nombre', 'Correo', 'Teléfono', 'Estado', 'Último acceso'];
    const rows = filteredUsers.map(u => [
      u.username || u.email || u.name,
      getRoleDisplayName(u),
      u.name,
      u.email || '',
      u.phone || '',
      u.active === false ? 'Inactivo' : 'Activo',
      u.lastLoginAt || 'Sin registros',
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_restaurante.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* LEFT SECTION: TOOLBAR + USERS TABLE */}
      <div className="lg:col-span-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className={`px-3.5 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isLight ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>

          <span className={`ml-auto text-[11px] font-semibold flex items-center gap-1 ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Creación exclusiva de Administrador
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre"
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          <div className="w-44">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              <option value="all">Rol: Todos</option>
              {customRoles.map(r => (
                <option key={r.id} value={r.id}>Rol: {r.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <button
              type="button"
              onClick={() => setShowInactive(!showInactive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                showInactive ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                showInactive ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
            <span>Mostrar inactivos</span>
          </label>
        </div>

        {/* Users Table */}
        <div className={`rounded-xl border overflow-x-auto ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <table className="w-full text-left text-xs min-w-[540px]">
            <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}>
              <tr>
                <th className="px-4 py-2.5 font-bold">Usuario</th>
                <th className="px-4 py-2.5 font-bold">Rol</th>
                <th className="px-4 py-2.5 font-bold">Nombre</th>
                <th className="px-4 py-2.5 font-bold">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.map(u => {
                const isSelected = selectedUserId === u.id;
                const displayUser = u.username || u.email || u.name.toLowerCase().replace(/\s+/g, '.');
                return (
                  <tr
                    key={u.id}
                    onClick={() => { sound.playTap(); setSelectedUserId(u.id); }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-100/80 text-slate-950 font-bold'
                          : 'bg-orange-950/40 text-white font-bold'
                        : isLight
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/60'
                    } ${u.active === false ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-semibold truncate max-w-[190px]">{displayUser}</td>
                    <td className="px-4 py-3">{getRoleDisplayName(u)}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-500 dark:text-slate-400">
                      {u.lastLoginAt || 'Sin accesos'}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No hay usuarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT INSPECTOR PANEL */}
      <div className={`lg:col-span-4 rounded-xl border p-5 min-h-[420px] flex flex-col ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {selectedUser ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <img
                src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={selectedUser.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black truncate">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rol: <span className="font-bold text-slate-800 dark:text-slate-200">{getRoleDisplayName(selectedUser)}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs flex-1">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Usuario</span>
                <span className="font-semibold">{selectedUser.username || selectedUser.email || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Correo</span>
                <span className="font-medium truncate max-w-[180px]">{selectedUser.email || 'Sin correo'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Teléfono</span>
                <span className="font-medium tabular-nums">{selectedUser.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">PIN de acceso</span>
                <span className="font-mono font-bold">•••• (Protegido)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Estado</span>
                <span className={`font-bold ${selectedUser.active === false ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {selectedUser.active === false ? 'Inactivo' : 'Activo'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Último acceso</span>
                <span className="tabular-nums">{selectedUser.lastLoginAt || 'Sin registros'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              {selectedUser.id !== currentAuthUser.id && (
                <button
                  type="button"
                  onClick={() => updateWaiter(selectedUser.id, { active: selectedUser.active === false })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                    isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  {selectedUser.active === false ? 'Reactivar' : 'Desactivar'}
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {selectedUser.id !== currentAuthUser.id && waiters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar al usuario "${selectedUser.name}"?`)) {
                        deleteWaiter(selectedUser.id);
                        setSelectedUserId(null);
                      }
                    }}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-600 cursor-pointer"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(selectedUser)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
                      : 'bg-orange-950/50 hover:bg-orange-900/60 text-orange-300 border border-orange-800/60'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400 space-y-2">
            <Users className="w-10 h-10 opacity-40" />
            <p className="text-xs font-medium">Selecciona un usuario para ver su detalle</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT USER MODAL (ADMIN ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-sm">
                {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario del Personal'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Rodrigo Morales"
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Usuario / Login *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    placeholder="ej: rodrigo@local.cl"
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">PIN de acceso *</label>
                  <input
                    type="password"
                    required
                    maxLength={8}
                    value={form.pin}
                    onChange={e => setForm({ ...form, pin: e.target.value })}
                    placeholder="4 dígitos"
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Rol asignado *</label>
                <select
                  value={form.customRoleId}
                  onChange={e => setForm({ ...form, customRoleId: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {customRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="correo@restaurante.cl"
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+56 9..."
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="accent-orange-500 w-4 h-4"
                />
                <span>Usuario activo (habilitado para iniciar sesión)</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingUserId ? 'Guardar cambios' : 'Crear usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
