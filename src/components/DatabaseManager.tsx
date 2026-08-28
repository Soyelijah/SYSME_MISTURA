import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import {
  Database, Download, Upload, RefreshCw, Trash2, Edit3, Plus,
  Search, CheckCircle2, AlertTriangle, FileCode2, FileJson,
  Layers, Package, Users, Utensils, DollarSign, ShieldAlert,
  HardDrive, Server, Copy, Check, Eye, ChevronRight, Filter,
  RotateCcw, Sparkles, X, Terminal, Cpu, FileSpreadsheet
} from 'lucide-react';
import { sound } from '../utils/sound';

export const DatabaseManager: React.FC = () => {
  const {
    products, setProducts,
    categories, setCategories,
    tables, setTables,
    salons,
    sales, setSales,
    shiftHistory, setShiftHistory,
    reports,
    waiters, setWaiters,
    restaurantBrand, updateRestaurantBrand,
    currentShift,
    themeMode
  } = usePOS();

  const isLight = themeMode === 'vibrant-light';

  // Active selected collection / table
  const [selectedTableKey, setSelectedTableKey] = useState<string>('products');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Edit / Add Record Modal
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [recordJsonText, setRecordJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Maintenance Dialogs
  const [maintenanceAction, setMaintenanceAction] = useState<'purge_sales' | 'reset_demo' | 'reset_stock' | 'factory_reset' | null>(null);
  const [confirmPhrase, setConfirmPhrase] = useState<string>('');

  // Status message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // Table definitions & Live Record count
  const tableDefinitions = useMemo(() => [
    {
      key: 'products',
      name: 'Productos & Menú',
      icon: Package,
      count: products.length,
      data: products,
      setData: setProducts,
      primaryKey: 'id',
      description: 'Platos, bebidas, alérgenos, precios con IVA y control de stock',
      color: 'from-amber-500 to-orange-600',
    },
    {
      key: 'categories',
      name: 'Categorías de Carta',
      icon: Layers,
      count: categories.length,
      data: categories,
      setData: setCategories,
      primaryKey: 'id',
      description: 'Familias gastronómicas, colores, iconos e imágenes asociadas',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      key: 'tables',
      name: 'Mesas & Salones',
      icon: Utensils,
      count: tables.length,
      data: tables,
      setData: setTables,
      primaryKey: 'id',
      description: 'Ubicaciones físicas, comensales por mesa, salón y estados en tiempo real',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      key: 'sales',
      name: 'Ventas & Comandas',
      icon: DollarSign,
      count: sales.length,
      data: sales,
      setData: setSales,
      primaryKey: 'id',
      description: 'Tickets emitidos, órdenes abiertas, desglose de líneas e impuestos',
      color: 'from-purple-500 to-violet-600',
    },
    {
      key: 'shiftHistory',
      name: 'Turnos & Cierres Z',
      icon: Server,
      count: shiftHistory.length,
      data: shiftHistory,
      setData: setShiftHistory,
      primaryKey: 'id',
      description: 'Histórico de aperturas de caja, arqueos, desvíos y cuadres fiscales',
      color: 'from-rose-500 to-pink-600',
    },
    {
      key: 'waiters',
      name: 'Usuarios & Permisos',
      icon: Users,
      count: waiters.length,
      data: waiters,
      setData: setWaiters,
      primaryKey: 'id',
      description: 'Camareros, cajeras, chefs y administradores con roles y claves PIN',
      color: 'from-cyan-500 to-blue-600',
    },
  ], [products, categories, tables, sales, shiftHistory, waiters]);

  const activeTableObj = tableDefinitions.find(t => t.key === selectedTableKey) || tableDefinitions[0];

  // Storage Stats Calculation
  const dbStats = useMemo(() => {
    const totalRecords = tableDefinitions.reduce((acc, curr) => acc + curr.count, 0);
    const dbPayload = {
      products,
      categories,
      tables,
      salons,
      sales,
      shiftHistory,
      reports,
      waiters,
      restaurantBrand,
      currentShift,
      exportedAt: new Date().toISOString(),
      system: 'Dy Pos Gastro Professional v2.0'
    };
    const jsonString = JSON.stringify(dbPayload);
    const byteSize = new Blob([jsonString]).size;
    const sizeKB = (byteSize / 1024).toFixed(2);

    return {
      totalRecords,
      sizeKB,
      version: '2.0-DyPos',
      collectionsCount: tableDefinitions.length + 3
    };
  }, [tableDefinitions, products, categories, tables, salons, sales, shiftHistory, reports, waiters, restaurantBrand, currentShift]);

  // Filter table rows based on search term
  const filteredRecords = useMemo(() => {
    const dataList = activeTableObj.data || [];
    if (!searchTerm.trim()) return dataList;
    const lower = searchTerm.toLowerCase();

    return dataList.filter((row: any) => {
      return Object.entries(row).some(([_, val]) => {
        if (typeof val === 'string') return val.toLowerCase().includes(lower);
        if (typeof val === 'number') return String(val).includes(lower);
        return false;
      });
    });
  }, [activeTableObj, searchTerm]);

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string) => {
    sound.playTap();
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // EXPORT JSON BACKUP
  const handleExportJSON = () => {
    sound.playSuccess();
    const backupData = {
      schemaVersion: '2.0-dypos',
      brand: 'Dy Pos Gastronomic Solution',
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      tables: {
        products,
        categories,
        tables,
        salons,
        sales,
        shiftHistory,
        reports,
        waiters,
        restaurantBrand,
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `dypos_backup_full_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad JSON descargada con éxito.');
  };

  // EXPORT SQL SCRIPT (Compatible with PostgreSQL / MySQL / SQLite)
  const handleExportSQL = () => {
    sound.playSuccess();
    let sql = `-- ========================================================\n`;
    sql += `-- DY POS GASTROBAR DATABASE DUMP\n`;
    sql += `-- Exportado el: ${new Date().toLocaleString('es-ES')}\n`;
    sql += `-- Sistema: Dy Pos Restaurant Management Suite\n`;
    sql += `-- ========================================================\n\n`;

    // 1. Categories Table
    sql += `-- TABLA: categorias\n`;
    sql += `CREATE TABLE IF NOT EXISTS dypos_categories (\n`;
    sql += `  id INT PRIMARY KEY,\n`;
    sql += `  name VARCHAR(255) NOT NULL,\n`;
    sql += `  icon VARCHAR(100),\n`;
    sql += `  color VARCHAR(100),\n`;
    sql += `  sort_order INT\n`;
    sql += `);\n\n`;

    categories.forEach(c => {
      sql += `INSERT INTO dypos_categories (id, name, icon, color, sort_order) VALUES (${c.id}, '${c.name.replace(/'/g, "''")}', '${c.icon}', '${c.color}', ${c.order}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`;
    });
    sql += `\n`;

    // 2. Products Table
    sql += `-- TABLA: productos\n`;
    sql += `CREATE TABLE IF NOT EXISTS dypos_products (\n`;
    sql += `  id VARCHAR(50) PRIMARY KEY,\n`;
    sql += `  name VARCHAR(255) NOT NULL,\n`;
    sql += `  category_id INT,\n`;
    sql += `  price DECIMAL(10,2),\n`;
    sql += `  buy_price DECIMAL(10,2),\n`;
    sql += `  iva DECIMAL(5,2),\n`;
    sql += `  stock INT,\n`;
    sql += `  min_stock INT,\n`;
    sql += `  is_kitchen BOOLEAN,\n`;
    sql += `  available BOOLEAN\n`;
    sql += `);\n\n`;

    products.forEach(p => {
      sql += `INSERT INTO dypos_products (id, name, category_id, price, buy_price, iva, stock, min_stock, is_kitchen, available) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', ${p.categoryId}, ${p.price}, ${p.buyPrice || 0}, ${p.iva}, ${p.stock}, ${p.minStock}, ${p.isKitchen ? 'TRUE' : 'FALSE'}, ${p.available ? 'TRUE' : 'FALSE'}) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;\n`;
    });
    sql += `\n`;

    // 3. Sales Table
    sql += `-- TABLA: ventas / tickets\n`;
    sql += `CREATE TABLE IF NOT EXISTS dypos_sales (\n`;
    sql += `  id INT PRIMARY KEY,\n`;
    sql += `  number VARCHAR(50),\n`;
    sql += `  date VARCHAR(50),\n`;
    sql += `  time VARCHAR(50),\n`;
    sql += `  table_number VARCHAR(50),\n`;
    sql += `  waiter_name VARCHAR(100),\n`;
    sql += `  subtotal DECIMAL(10,2),\n`;
    sql += `  tax_total DECIMAL(10,2),\n`;
    sql += `  total DECIMAL(10,2),\n`;
    sql += `  status VARCHAR(50)\n`;
    sql += `);\n\n`;

    sales.forEach(s => {
      sql += `INSERT INTO dypos_sales (id, number, date, time, table_number, waiter_name, subtotal, tax_total, total, status) VALUES (${s.id}, '${s.number}', '${s.date}', '${s.time}', '${s.tableNumber || 'S/M'}', '${(s.waiterName || '').replace(/'/g, "''")}', ${s.subtotal}, ${s.taxTotal}, ${s.total}, '${s.status}');\n`;
    });
    sql += `\n`;

    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `dypos_database_dump_${dateStr}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Script SQL exportado con éxito.');
  };

  // EXPORT CURRENT TABLE TO CSV
  const handleExportCSV = () => {
    sound.playSuccess();
    const dataList = activeTableObj.data || [];
    if (dataList.length === 0) return;

    const headers = Object.keys(dataList[0]);
    const csvRows = [headers.join(',')];

    dataList.forEach(item => {
      const row = headers.map(h => {
        const val = item[h];
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      });
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dypos_${activeTableObj.key}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Tabla ${activeTableObj.name} exportada a CSV.`);
  };

  // IMPORT DATABASE JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const data = parsed.tables || parsed;

        if (data.products && Array.isArray(data.products)) setProducts(data.products);
        if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
        if (data.tables && Array.isArray(data.tables)) setTables(data.tables);
        if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
        if (data.shiftHistory && Array.isArray(data.shiftHistory)) setShiftHistory(data.shiftHistory);
        if (data.waiters && Array.isArray(data.waiters)) setWaiters(data.waiters);
        if (data.restaurantBrand) updateRestaurantBrand(data.restaurantBrand);

        sound.playSuccess();
        showToast('¡Base de datos importada y restaurada exitosamente!');
      } catch (err: any) {
        sound.playError();
        alert('Error al leer el archivo de respaldo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // RECORD ACTIONS (CRUD)
  const handleOpenEditRecord = (record: any) => {
    sound.playTap();
    setEditingRecord(record);
    setIsNewRecord(false);
    setRecordJsonText(JSON.stringify(record, null, 2));
    setJsonError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenNewRecord = () => {
    sound.playTap();
    setIsNewRecord(true);
    let template: any = {};
    if (selectedTableKey === 'products') {
      template = {
        id: `PROD-${Date.now().toString().slice(-4)}`,
        name: 'Nuevo Plato Dy Pos',
        categoryId: categories[0]?.id || 1,
        price: 15.00,
        buyPrice: 4.50,
        iva: 10,
        stock: 50,
        minStock: 10,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        isKitchen: true,
        kitchenBlock: 1,
        description: 'Descripción del producto gourmet',
        allergens: [],
        available: true
      };
    } else if (selectedTableKey === 'categories') {
      template = {
        id: categories.length + 1,
        name: 'Nueva Categoría',
        icon: 'Utensils',
        color: 'from-amber-500 to-orange-600',
        order: categories.length + 1
      };
    } else {
      template = { id: Date.now() };
    }

    setEditingRecord(template);
    setRecordJsonText(JSON.stringify(template, null, 2));
    setJsonError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveRecord = () => {
    try {
      const parsed = JSON.parse(recordJsonText);
      const pk = activeTableObj.primaryKey;
      const currentData = [...activeTableObj.data];

      if (isNewRecord) {
        currentData.unshift(parsed);
      } else {
        const index = currentData.findIndex(item => item[pk] === editingRecord[pk]);
        if (index !== -1) {
          currentData[index] = parsed;
        } else {
          currentData.unshift(parsed);
        }
      }

      activeTableObj.setData(currentData);
      sound.playSuccess();
      setIsEditModalOpen(false);
      showToast('Registro guardado correctamente en la base de datos.');
    } catch (err: any) {
      sound.playError();
      setJsonError('JSON inválido: ' + err.message);
    }
  };

  const handleDeleteRecord = (recordId: any) => {
    if (!window.confirm(`¿Seguro que deseas eliminar este registro (${recordId}) de ${activeTableObj.name}?`)) return;
    sound.playTap();
    const pk = activeTableObj.primaryKey;
    const updated = activeTableObj.data.filter((item: any) => item[pk] !== recordId);
    activeTableObj.setData(updated);
    showToast(`Registro ${recordId} eliminado.`);
  };

  // MAINTENANCE ACTIONS
  const handleExecuteMaintenance = () => {
    if (maintenanceAction === 'purge_sales') {
      if (confirmPhrase.trim().toUpperCase() !== 'PURGAR') {
        alert('Por favor escribe PURGAR para confirmar.');
        return;
      }
      sound.playSuccess();
      setSales([]);
      setShiftHistory([]);
      // Free all tables
      const cleanedTables = tables.map(t => ({
        ...t,
        status: 'free' as const,
        currentSaleId: null,
        total: 0,
        diners: 0
      }));
      setTables(cleanedTables);
      showToast('Historial de ventas y tickets purgado. Mesas liberadas.');
      setMaintenanceAction(null);
      setConfirmPhrase('');
    } else if (maintenanceAction === 'reset_stock') {
      sound.playSuccess();
      const updatedProds = products.map(p => ({ ...p, stock: 100 }));
      setProducts(updatedProds);
      showToast('Stock de todos los productos restablecido a 100 unidades.');
      setMaintenanceAction(null);
      setConfirmPhrase('');
    } else if (maintenanceAction === 'factory_reset') {
      if (confirmPhrase.trim().toUpperCase() !== 'RESET DYPOS') {
        alert('Por favor escribe RESET DYPOS para confirmar el formateo total.');
        return;
      }
      sound.playSuccess();
      localStorage.clear();
      sessionStorage.clear();
      showToast('Restablecimiento completo ejecutado. Reiniciando terminal...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className={`p-4 sm:p-6 space-y-6 ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Database Master Header */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-700'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-indigo-500/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center font-black">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 font-serif">
                  <span>Dy Pos Data Studio & Engine</span>
                  <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-400/30">
                    Solo Administrador
                  </span>
                </h1>
                <p className="text-xs text-indigo-200/90 font-medium">
                  Motor de persistencia, explorador de colecciones, backups SQL/JSON y copias de seguridad del restaurante.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="touch-btn px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 border border-indigo-400/30 active:scale-95"
            >
              <FileJson className="w-4 h-4 text-indigo-200" />
              <span>Backup JSON</span>
            </button>

            {/* Export SQL */}
            <button
              onClick={handleExportSQL}
              className="touch-btn px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 border border-purple-400/30 active:scale-95"
            >
              <FileCode2 className="w-4 h-4 text-purple-200" />
              <span>Dump SQL DDL</span>
            </button>

            {/* Import JSON file input */}
            <label className="touch-btn px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 border border-slate-600 cursor-pointer active:scale-95">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Restaurar Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Real-time Storage Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Registros Totales</span>
            <span className="text-base font-black text-white font-mono">{dbStats.totalRecords} filas</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Tamaño en Memoria</span>
            <span className="text-base font-black text-emerald-400 font-mono">{dbStats.sizeKB} KB</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Motor de Almacenamiento</span>
            <span className="text-base font-black text-indigo-200">DyPos LocalStore</span>
          </div>
          <div className="bg-black/40 p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-slate-300 font-semibold block">Integridad de Esquema</span>
            <span className="text-base font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% OK
            </span>
          </div>
        </div>
      </div>

      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tableDefinitions.map(table => {
          const Icon = table.icon;
          const isSelected = selectedTableKey === table.key;
          return (
            <button
              key={table.key}
              onClick={() => {
                sound.playTap();
                setSelectedTableKey(table.key);
                setSearchTerm('');
              }}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400'
                  : isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{table.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {table.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Explorer & Grid */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Buscar en ${activeTableObj.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white'
                    : 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
            <span className={`text-xs font-mono font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {filteredRecords.length} filas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Exportar esta tabla a CSV"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handleOpenNewRecord}
              className="touch-btn px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>

        {/* Records Data Table */}
        <div className={`overflow-x-auto rounded-2xl border max-h-[500px] ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <table className="w-full text-left text-xs">
            <thead className={`sticky top-0 z-10 text-[11px] uppercase tracking-wider font-mono font-bold ${
              isLight ? 'bg-slate-100 text-slate-800 border-b border-slate-200' : 'bg-slate-950 text-slate-400 border-b border-slate-800'
            }`}>
              <tr>
                <th className="p-3">ID / Clave</th>
                <th className="p-3">Nombre / Identificador</th>
                <th className="p-3">Datos Clave</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${
              isLight ? 'divide-slate-200 text-slate-900' : 'divide-slate-800/60 text-slate-100'
            }`}>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 100).map((record: any, idx: number) => {
                  const pk = activeTableObj.primaryKey;
                  const pkVal = record[pk] || idx;
                  const mainName = record.name || record.number || record.code || `Registro #${pkVal}`;

                  return (
                    <tr
                      key={pkVal}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-indigo-50/40' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {String(pkVal)}
                      </td>
                      <td className={`p-3 font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {mainName}
                      </td>
                      <td className={`p-3 text-[11px] max-w-md truncate font-mono ${
                        isLight ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}>
                        {JSON.stringify(record)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditRecord(record)}
                            title="Editar / Ver JSON del registro"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isLight
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                : 'bg-slate-800 text-indigo-400 hover:bg-slate-700'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(pkVal)}
                            title="Eliminar este registro"
                            className={`p-1.5 rounded-lg transition-colors ${
                              isLight
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-rose-950/40 text-rose-400 hover:bg-rose-900/50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Database Maintenance & Reset Toolbox */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Herramientas de Mantenimiento & Purgado (Zona Protegida)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Purgar Ventas */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">Purgar Ventas de Prueba</span>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Elimina tickets y pedidos de prueba dejando el catálogo de platos y usuarios intactos.
              </span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setMaintenanceAction('purge_sales');
                setConfirmPhrase('');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/40 self-start transition-all"
            >
              Purgar Historial
            </button>
          </div>

          {/* Resetear Stock */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block">Resetear Stock de Productos</span>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Restaura el inventario de todos los platos y bebidas a 100 unidades automáticamente.
              </span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setMaintenanceAction('reset_stock');
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-800 dark:text-blue-300 font-bold border border-blue-500/40 self-start transition-all"
            >
              Restablecer Stock
            </button>
          </div>

          {/* Hard Reset */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <span className="font-extrabold text-rose-700 dark:text-rose-400 block">Formateo de Fábrica (Hard Reset)</span>
              <span className={`text-[11px] block mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Borra todo el almacenamiento local y reinicia el sistema a sus valores iniciales limpios.
              </span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setMaintenanceAction('factory_reset');
                setConfirmPhrase('');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 font-bold border border-rose-500/40 self-start transition-all"
            >
              Formatear Todo
            </button>
          </div>
        </div>
      </div>

      {/* JSON Record Modal Editor */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-indigo-500" />
                <h3 className="font-black text-sm">
                  {isNewRecord ? `Nuevo Registro en ${activeTableObj.name}` : `Editar Registro JSON (${editingRecord?.[activeTableObj.primaryKey]})`}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                Modifique los campos en formato JSON. Se validará la sintaxis antes de guardar en la base de datos local.
              </p>
              <textarea
                value={recordJsonText}
                onChange={(e) => {
                  setRecordJsonText(e.target.value);
                  setJsonError(null);
                }}
                className={`w-full h-80 p-3 rounded-2xl font-mono text-xs border outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-emerald-400 focus:border-indigo-500'
                }`}
              />
              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs font-semibold">
                  {jsonError}
                </div>
              )}
            </div>

            <div className={`p-4 border-t flex items-center justify-end gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isLight
                    ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRecord}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md shadow-indigo-600/30"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Confirmation Modal */}
      {maintenanceAction && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black">
                {maintenanceAction === 'purge_sales' && '¿Confirmar Purgado de Ventas?'}
                {maintenanceAction === 'reset_stock' && '¿Restablecer Stock de Menú?'}
                {maintenanceAction === 'factory_reset' && '¿Formateo Completo de Fábrica?'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                {maintenanceAction === 'purge_sales' && 'Esta acción borrará todas las comandas y ventas de prueba. Para confirmar escribe PURGAR:'}
                {maintenanceAction === 'reset_stock' && 'Todos los productos tendrán un stock establecido de 100 unidades.'}
                {maintenanceAction === 'factory_reset' && 'Se borrarán todos los datos personalizados. Para confirmar escribe RESET DYPOS:'}
              </p>
            </div>

            {(maintenanceAction === 'purge_sales' || maintenanceAction === 'factory_reset') && (
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder={maintenanceAction === 'purge_sales' ? 'PURGAR' : 'RESET DYPOS'}
                className={`w-full text-center py-2.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider outline-none ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setMaintenanceAction(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  isLight
                    ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                    : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteMaintenance}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md shadow-rose-600/30"
              >
                Confirmar y Ejecutar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
