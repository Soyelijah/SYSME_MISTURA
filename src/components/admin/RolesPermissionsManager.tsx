import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomRole, UserRole } from '../../types';
import { PERMISSION_CATALOG, ALL_PERMISSION_KEYS } from '../../data/defaultConfigs';
import { sound } from '../../utils/sound';
import { Search, Plus, ChevronDown, ChevronRight, Edit2, Trash2, Check, X, Shield } from 'lucide-react';

export const RolesPermissionsManager: React.FC = () => {
  const { customRoles, addCustomRole, updateCustomRole, deleteCustomRole, waiters, themeMode } = usePOS();
  const isLight = themeMode === 'vibrant-light';

  const [search, setSearch] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(customRoles[0]?.id || '');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ salon: true });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);

  const [draftRole, setDraftRole] = useState<{
    name: string;
    description: string;
    baseRole: UserRole;
    isWaiter: boolean;
    isDeliveryDriver: boolean;
    permissions: Record<string, boolean>;
  }>({
    name: '',
    description: '',
    baseRole: 'waiter',
    isWaiter: false,
    isDeliveryDriver: false,
    permissions: {},
  });

  const filteredRoles = customRoles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedRole = customRoles.find(r => r.id === selectedRoleId) || customRoles[0] || null;
  const totalPermsCount = ALL_PERMISSION_KEYS.length;

  const getEnabledCount = (perms: Record<string, boolean>) =>
    ALL_PERMISSION_KEYS.filter(k => !!perms[k]).length;

  const getUsersCountForRole = (role: CustomRole) =>
    waiters.filter(w => w.customRoleId === role.id || (!w.customRoleId && w.role === role.baseRole)).length;

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleOpenCreate = () => {
    sound.playTap();
    const emptyPerms: Record<string, boolean> = {};
    ALL_PERMISSION_KEYS.forEach(k => { emptyPerms[k] = false; });
    setDraftRole({
      name: '',
      description: '',
      baseRole: 'waiter',
      isWaiter: false,
      isDeliveryDriver: false,
      permissions: emptyPerms,
    });
    setIsCreateMode(true);
    setIsEditMode(true);
    setExpandedGroups({ salon: true, delivery: true });
  };

  const handleOpenEdit = (role: CustomRole) => {
    sound.playTap();
    setDraftRole({
      name: role.name,
      description: role.description || '',
      baseRole: role.baseRole,
      isWaiter: role.isWaiter,
      isDeliveryDriver: role.isDeliveryDriver,
      permissions: { ...role.permissions },
    });
    setIsCreateMode(false);
    setIsEditMode(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftRole.name.trim()) return;
    sound.playTap();

    const inferredBase: UserRole =
      draftRole.isDeliveryDriver && !draftRole.permissions['finanzas.open_close_cash']
        ? 'delivery'
        : draftRole.baseRole;

    if (isCreateMode) {
      const created = addCustomRole({
        ...draftRole,
        baseRole: inferredBase,
      });
      setSelectedRoleId(created.id);
    } else if (selectedRole) {
      updateCustomRole(selectedRole.id, {
        ...draftRole,
        baseRole: inferredBase,
      });
    }
    setIsEditMode(false);
    setIsCreateMode(false);
  };

  const togglePermissionKey = (key: string) => {
    setDraftRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const toggleEntireGroup = (groupKeys: string[], nextVal: boolean) => {
    setDraftRole(prev => {
      const nextPerms = { ...prev.permissions };
      groupKeys.forEach(k => { nextPerms[k] = nextVal; });
      return { ...prev, permissions: nextPerms };
    });
  };

  const displayedPermissions = isEditMode ? draftRole.permissions : (selectedRole?.permissions || {});

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* LEFT TABLE OF ROLES */}
      <div className="lg:col-span-7 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar rol..."
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear rol</span>
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <table className="w-full text-left text-xs">
            <thead className={isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}>
              <tr>
                <th className="px-4 py-2.5 font-bold">Nombre</th>
                <th className="px-4 py-2.5 font-bold">Permisos</th>
                <th className="px-4 py-2.5 font-bold">Usuarios con rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredRoles.map(role => {
                const isSelected = !isCreateMode && (selectedRole?.id === role.id);
                const enabledCount = getEnabledCount(role.permissions);
                const usersCount = getUsersCountForRole(role);
                return (
                  <tr
                    key={role.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedRoleId(role.id);
                      setIsEditMode(false);
                      setIsCreateMode(false);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? isLight
                          ? 'bg-amber-200/70 text-slate-950 font-bold'
                          : 'bg-orange-950/40 text-white font-bold'
                        : isLight
                        ? 'hover:bg-slate-50'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">{role.name}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {enabledCount === 0 ? 'Sin permisos' : `${enabledCount} de ${totalPermsCount}`}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{usersCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT INSPECTOR / PERMISSION ACCORDION PANEL */}
      <div className={`lg:col-span-5 rounded-xl border overflow-hidden flex flex-col max-h-[75vh] ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        {isEditMode ? (
          <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isLight ? 'bg-amber-100/80 border-amber-200 text-slate-900' : 'bg-orange-950/40 border-slate-800 text-white'
            }`}>
              <span className="text-sm font-black">
                {isCreateMode ? 'Crear rol personalizado' : `Editar rol: ${selectedRole?.name}`}
              </span>
              <button
                type="button"
                onClick={() => { setIsEditMode(false); setIsCreateMode(false); }}
                className="p-1 rounded-lg hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Nombre del rol *</label>
                  <input
                    type="text"
                    required
                    value={draftRole.name}
                    onChange={e => setDraftRole({ ...draftRole, name: e.target.value })}
                    placeholder="Ej: supervisor, host, repartidor_noche"
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Nivel base de interfaz</label>
                  <select
                    value={draftRole.baseRole}
                    onChange={e => setDraftRole({ ...draftRole, baseRole: e.target.value as UserRole })}
                    className={`w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  >
                    <option value="admin">Administrador (Acceso total)</option>
                    <option value="manager">Encargado / Manager</option>
                    <option value="cashier">Cajero / Mostrador</option>
                    <option value="waiter">Garzón / Camarero</option>
                    <option value="kitchen">Cocina KDS</option>
                    <option value="delivery">Repartidor Delivery</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                    <span>Es camarero</span>
                    <button
                      type="button"
                      onClick={() => setDraftRole({ ...draftRole, isWaiter: !draftRole.isWaiter })}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        draftRole.isWaiter ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        draftRole.isWaiter ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between text-xs font-bold cursor-pointer">
                    <span>Es repartidor</span>
                    <button
                      type="button"
                      onClick={() => setDraftRole({ ...draftRole, isDeliveryDriver: !draftRole.isDeliveryDriver })}
                      className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        draftRole.isDeliveryDriver ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        draftRole.isDeliveryDriver ? 'translate-x-4.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </label>
                </div>
              </div>

              {/* Permission Groups Accordion */}
              <div className="space-y-2 pt-2">
                {PERMISSION_CATALOG.map(group => {
                  const isOpen = !!expandedGroups[group.id];
                  const activeInGroup = group.items.filter(i => !!displayedPermissions[i.key]).length;
                  const allInGroup = activeInGroup === group.items.length;

                  return (
                    <div
                      key={group.id}
                      className={`rounded-xl border overflow-hidden ${
                        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.id)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>{group.label}</span>
                        </span>
                        <span className="flex items-center gap-2 text-slate-500 tabular-nums font-medium">
                          <span>
                            {activeInGroup === 0 ? 'Sin permisos' : `${activeInGroup} de ${group.items.length}`}
                          </span>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => toggleEntireGroup(group.items.map(i => i.key), !allInGroup)}
                              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                            >
                              {allInGroup ? 'Quitar todos' : 'Marcar todos'}
                            </button>
                          </div>
                          {group.items.map(item => (
                            <label key={item.key} className="flex items-center gap-2.5 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!displayedPermissions[item.key]}
                                onChange={() => togglePermissionKey(item.key)}
                                className="accent-orange-500 w-4 h-4 shrink-0"
                              />
                              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsEditMode(false); setIsCreateMode(false); }}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar rol</span>
              </button>
            </div>
          </form>
        ) : selectedRole ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className={`px-4 py-3 border-b ${
              isLight ? 'bg-amber-200/70 border-amber-300 text-slate-950' : 'bg-orange-950/40 border-slate-800 text-white'
            }`}>
              <h3 className="text-sm font-black">{selectedRole.name}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="space-y-2 text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Es camarero</span>
                  <span>{selectedRole.isWaiter ? 'Sí' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Es repartidor</span>
                  <span>{selectedRole.isDeliveryDriver ? 'Sí' : 'No'}</span>
                </div>
              </div>

              <div className="space-y-2">
                {PERMISSION_CATALOG.map(group => {
                  const isOpen = !!expandedGroups[group.id];
                  const activeInGroup = group.items.filter(i => !!selectedRole.permissions[i.key]).length;
                  return (
                    <div
                      key={group.id}
                      className={`rounded-xl border overflow-hidden ${
                        isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.id)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                          <span>{group.label}</span>
                        </span>
                        <span className="flex items-center gap-2 text-slate-500 tabular-nums font-medium">
                          <span>{activeInGroup === 0 ? 'Sin permisos' : `${activeInGroup} de ${group.items.length}`}</span>
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                          {group.items.map(item => {
                            const has = !!selectedRole.permissions[item.key];
                            return (
                              <div key={item.key} className="flex items-center gap-2 text-xs">
                                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${
                                  has ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                }`}>
                                  {has ? '✓' : '—'}
                                </span>
                                <span className={has ? 'font-medium' : 'text-slate-400'}>{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              {selectedRole.baseRole !== 'admin' && customRoles.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el rol "${selectedRole.name}"?`)) {
                      deleteCustomRole(selectedRole.id);
                      setSelectedRoleId(customRoles.find(r => r.id !== selectedRole.id)?.id || '');
                    }
                  }}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-600 cursor-pointer"
                  title="Eliminar rol"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedRole)}
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
        ) : null}
      </div>
    </div>
  );
};
