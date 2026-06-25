import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Plus, Trash2, Edit, LogOut, ArrowLeft, Database, AlertCircle, Check, Crown, Upload, Users } from 'lucide-react';
import { Pagination } from 'flowbite-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PLANES_LOCALES, Plan, resolverImagen } from '../store/planesData';
import defaultCardImg from '../assets/prime_video_completa.webp';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [planes, setPlanes] = useState<Plan[]>([]);
  
  // Refs
  const formRef = useRef<HTMLDivElement | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = false;
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Database Form State
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [precio, setPrecio] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [descripcionLarga, setDescripcionLarga] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [caracteristicas, setCaracteristicas] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [agotado, setAgotado] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Roles & Users State
  const [activeTab, setActiveTab] = useState<'services' | 'users'>('services');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  const isConnected = isSupabaseConfigured();

  // Obtener perfil del usuario actual para ver su rol
  async function fetchUserProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;

      // Bloquear acceso si no es administrador y cerrar sesión
      if (data && data.rol !== 'admin' && userId !== '1' && userEmail !== 'admin@chopper.com') {
        setAuthError('Acceso denegado: No tienes permisos de administrador.');
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUserProfile(null);
        return;
      }

      setCurrentUserProfile(data);
    } catch (err) {
      console.error('Error al cargar perfil de usuario:', err);
    }
  }

  // Obtener lista de todos los usuarios (solo permitido para admins)
  async function fetchUsuarios() {
    setLoadingUsuarios(true);
    setUsersError(null);

    if (!isConnected) {
      // Simulación local (Demo)
      const localUsers = localStorage.getItem('chopper_local_usuarios');
      if (localUsers) {
        try {
          setUsuarios(JSON.parse(localUsers));
        } catch (e) {
          const defaultUsers = [
            { id: '1', email: 'admin@chopper.com', rol: 'admin', creado_el: new Date().toISOString() },
            { id: '2', email: 'usuario_demo1@gmail.com', rol: 'user', creado_el: new Date().toISOString() },
            { id: '3', email: 'usuario_demo2@outlook.com', rol: 'user', creado_el: new Date().toISOString() }
          ];
          localStorage.setItem('chopper_local_usuarios', JSON.stringify(defaultUsers));
          setUsuarios(defaultUsers);
        }
      } else {
        const defaultUsers = [
          { id: '1', email: 'admin@chopper.com', rol: 'admin', creado_el: new Date().toISOString() },
          { id: '2', email: 'usuario_demo1@gmail.com', rol: 'user', creado_el: new Date().toISOString() },
          { id: '3', email: 'usuario_demo2@outlook.com', rol: 'user', creado_el: new Date().toISOString() }
        ];
        localStorage.setItem('chopper_local_usuarios', JSON.stringify(defaultUsers));
        setUsuarios(defaultUsers);
      }
      setLoadingUsuarios(false);
      return;
    }

    if (!supabase) {
      setLoadingUsuarios(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('creado_el', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err: any) {
      setUsersError(err.message || 'Error al obtener la lista de usuarios.');
    } finally {
      setLoadingUsuarios(false);
    }
  }

  // 1. Escuchar estado de sesión de Supabase o local
  useEffect(() => {
    if (!isConnected || !supabase) {
      // Si no hay Supabase, comprobar login local simulado
      const localSession = localStorage.getItem('chopper_local_session');
      if (localSession) {
        setSession({ user: { id: '1', email: 'admin@chopper.com', user_metadata: { role: 'admin' } } });
        setCurrentUserProfile({ id: '1', email: 'admin@chopper.com', rol: 'admin' });
        
        const localPlanes = localStorage.getItem('chopper_local_planes_v2');
        if (localPlanes) {
          try {
            const parsed = JSON.parse(localPlanes);
            setPlanes(parsed);
          } catch (e) {
            setPlanes(PLANES_LOCALES);
          }
        } else {
          localStorage.setItem('chopper_local_planes_v2', JSON.stringify(PLANES_LOCALES));
          setPlanes(PLANES_LOCALES);
        }
      }
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchPlanes();
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchPlanes();
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConnected]);

  // Obtener usuarios cuando cambia la pestaña a 'users' o cuando inicia sesión
  useEffect(() => {
    if (session && activeTab === 'users') {
      fetchUsuarios();
    }
  }, [session, activeTab]);

  // Resetear paginación si se añade o borra un plan
  useEffect(() => {
    setCurrentPage(1);
  }, [planes.length]);

  // 2. Obtener planes de la base de datos
  async function fetchPlanes() {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('planes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlanes(data || []);
    } catch (err: any) {
      setDbError(err.message || 'Error al cargar los planes.');
    } finally {
      setLoading(false);
    }
  }

  // 3. Login y Registro
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setLoading(true);

    if (!isConnected) {
      // Simulación local
      if (email === 'admin@chopper.com' && password === 'admin123') {
        localStorage.setItem('chopper_local_session', 'true');
        setSession({ user: { email: 'admin@chopper.com', user_metadata: { role: 'admin' } } });
        
        const localPlanes = localStorage.getItem('chopper_local_planes_v2');
        if (localPlanes) {
          try {
            const parsed = JSON.parse(localPlanes);
            setPlanes(parsed);
          } catch (e) {
            setPlanes(PLANES_LOCALES);
          }
        } else {
          localStorage.setItem('chopper_local_planes_v2', JSON.stringify(PLANES_LOCALES));
          setPlanes(PLANES_LOCALES);
        }

        setAuthSuccess('¡Sesión local iniciada correctamente!');
      } else {
        setAuthError('Credenciales demo incorrectas. Usa admin@chopper.com y clave admin123');
      }
      setLoading(false);
      return;
    }

    try {
      if (!supabase) return;
      if (isRegister) {
        // Registro (por defecto como usuario normal)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'user' } // Rol por defecto
          }
        });
        if (error) throw error;
        setAuthSuccess('Registro exitoso. Revisa tu correo o inicia sesión.');
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthSuccess('¡Sesión iniciada con éxito!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isConnected) {
      localStorage.removeItem('chopper_local_session');
      setSession(null);
      return;
    }
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  // Subir imagen (Local read as Base64 / Supabase upload)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setDbError(null);

    if (!isConnected || !supabase) {
      // Simulación local: Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setDbError('Error al leer el archivo de imagen.');
        setLoading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    // Modo conectado: Supabase Storage
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `plan-cards/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImagen(publicUrl);
    } catch (err: any) {
      setDbError(`Error al subir imagen a Supabase: ${err.message}. Asegúrate de que el bucket público 'images' exista.`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Guardar / Editar Plan
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbError(null);
    setLoading(true);

    const planData = {
      nombre,
      plataforma,
      precio: Number(precio),
      descripcion,
      descripcionLarga: descripcionLarga || '',
      imagen: imagen || '/src/assets/prime_video_completa.webp',
      categoria: (categoriasSeleccionadas[0] || 'video') as Plan['categoria'],
      categorias: categoriasSeleccionadas.length > 0 ? categoriasSeleccionadas : ['video'],
      caracteristicas: caracteristicas.split(',').map(c => c.trim()).filter(Boolean),
      destacado,
      agotado,
    };

    if (!isConnected) {
      // Guardar localmente
      let updatedPlanes = [...planes];
      if (editingPlan) {
        // Editar existente
        updatedPlanes = updatedPlanes.map(p => p.id === editingPlan.id ? { ...p, ...planData } : p);
      } else {
        // Crear nuevo
        const newPlan = { ...planData, id: `plan-${Date.now()}` };
        updatedPlanes.unshift(newPlan);
      }
      localStorage.setItem('chopper_local_planes_v2', JSON.stringify(updatedPlanes));
      setPlanes(updatedPlanes);
      closeForm();
      setLoading(false);
      return;
    }

    try {
      if (!supabase) return;
      if (editingPlan) {
        // Actualizar en Supabase
        const { error } = await supabase
          .from('planes')
          .update(planData)
          .eq('id', editingPlan.id);
        if (error) throw error;
      } else {
        // Insertar en Supabase
        const { error } = await supabase
          .from('planes')
          .insert([planData]);
        if (error) throw error;
      }
      fetchPlanes();
      closeForm();
    } catch (err: any) {
      setDbError(err.message || 'Error al guardar el plan.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Eliminar Plan
  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;
    setDbError(null);
    setLoading(true);

    if (!isConnected) {
      const updated = planes.filter(p => p.id !== planId);
      localStorage.setItem('chopper_local_planes_v2', JSON.stringify(updated));
      setPlanes(updated);
      setLoading(false);
      return;
    }

    try {
      if (!supabase) return;
      const { error } = await supabase
        .from('planes')
        .delete()
        .eq('id', planId);
      if (error) throw error;
      fetchPlanes();
    } catch (err: any) {
      setDbError(err.message || 'Error al eliminar el plan.');
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (plan: Plan) => {
    setEditingPlan(plan);
    setNombre(plan.nombre);
    setPlataforma(plan.plataforma);
    setPrecio(plan.precio);
    setDescripcion(plan.descripcion);
    setDescripcionLarga(plan.descripcionLarga || '');
    setImagen(plan.imagen || '');
    setCategoriasSeleccionadas(plan.categorias || (plan.categoria ? [plan.categoria] : ['video']));
    setCaracteristicas(plan.caracteristicas.join(', '));
    setDestacado(!!plan.destacado);
    setAgotado(!!plan.agotado);
    setFormOpen(true);

    // Auto-scroll al formulario
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const openCreateForm = () => {
    setEditingPlan(null);
    setNombre('');
    setPlataforma('');
    setPrecio(0);
    setDescripcion('');
    setDescripcionLarga('');
    setImagen('');
    setCategoriasSeleccionadas(['video']);
    setCaracteristicas('');
    setDestacado(false);
    setAgotado(false);
    setFormOpen(true);

    // Auto-scroll al formulario
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPlan(null);
    setDescripcionLarga('');
    setCategoriasSeleccionadas([]);
  };

  // Cambiar el rol de un usuario
  const handleToggleRole = async (userId: string, currentRol: string) => {
    const nuevoRol = currentRol === 'admin' ? 'user' : 'admin';
    
    if (userId === session?.user?.id) {
      if (!window.confirm('¿Estás seguro de que quieres quitarte el rol de Administrador? Perderás el acceso a la edición.')) {
        return;
      }
    } else {
      if (!window.confirm(`¿Estás seguro de que quieres cambiar el rol de este usuario a ${nuevoRol.toUpperCase()}?`)) {
        return;
      }
    }

    if (!isConnected) {
      // Simulación local (Demo)
      const updated = usuarios.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u);
      localStorage.setItem('chopper_local_usuarios', JSON.stringify(updated));
      setUsuarios(updated);
      
      // Si se edita a sí mismo
      if (userId === '1') {
        setCurrentUserProfile((prev: any) => prev ? { ...prev, rol: nuevoRol } : null);
      }
      return;
    }

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ rol: nuevoRol })
        .eq('id', userId);

      if (error) throw error;

      // Actualizar estado local
      setUsuarios((prev: any[]) => prev.map((u: any) => u.id === userId ? { ...u, rol: nuevoRol } : u));

      // Si se editó a sí mismo, actualizar perfil actual
      if (userId === session?.user?.id) {
        setCurrentUserProfile((prev: any) => prev ? { ...prev, rol: nuevoRol } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el rol del usuario.');
    }
  };

  const userEmail = session?.user?.email;
  const isAdmin = !isConnected || userEmail === 'admin@chopper.com' || currentUserProfile?.rol === 'admin';

  // 1. Ordenar por destacados (TOP) primero, y luego alfabéticamente por Plataforma y Nombre
  const planesOrdenados = [...planes].sort((a, b) => {
    const aDest = !!a.destacado;
    const bDest = !!b.destacado;
    if (aDest !== bDest) {
      return aDest ? -1 : 1; // Destacados arriba
    }
    const platCompare = a.plataforma.localeCompare(b.plataforma, 'es', { sensitivity: 'base' });
    if (platCompare !== 0) return platCompare;
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  });

  // 2. Paginación de 10 en 10 para la tabla del Admin
  const totalPages = Math.ceil(planesOrdenados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = planesOrdenados.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-brand-900 text-white flex flex-col justify-between py-8 px-4 md:px-16 lg:px-24 xl:px-32 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none opacity-50" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none animate-float" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-brand-800">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-brand-400" />
          <span className="font-bold text-sm tracking-widest uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
            Streaming Chopper Panel
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex items-center justify-center py-6">
        
        {/* Caso A: Usuario NO Logueado */}
        {!session ? (
          <div className="w-full max-w-md glass border border-brand-700/50 rounded-3xl p-8 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-6 h-6 text-brand-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
              {isRegister ? 'Crear Cuenta' : 'Acceso Administrativo'}
            </h1>
            <p className="text-xs text-gray-400 text-center mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              {!isConnected 
                ? 'Modo Demostración local (Supabase no configurado)'
                : isRegister 
                  ? 'Regístrate para obtener una cuenta de usuario normal'
                  : 'Ingresa tus credenciales para administrar servicios'}
            </p>

            {authError && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl p-3 mb-4 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="bg-green-900/40 border border-green-500/50 text-green-300 rounded-xl p-3 mb-4 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col gap-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@chopper.com"
                  required
                  className="w-full px-4 py-2.5 bg-brand-900/80 border border-brand-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-brand-900/80 border border-brand-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-medium text-sm transition-all active:scale-[0.98] mt-2 shadow-lg shadow-brand-500/20"
              >
                {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              {isConnected ? (
                <span className="text-gray-505 font-medium">Área de acceso restringido para personal autorizado.</span>
              ) : (
                <div className="bg-brand-800/40 p-3 rounded-lg border border-brand-700/30">
                  <p className="font-semibold text-[10px] uppercase text-brand-400 tracking-wider">Credenciales Demo:</p>
                  <p className="mt-1">Email: <code className="text-white">admin@chopper.com</code></p>
                  <p>Clave: <code className="text-white">admin123</code></p>
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* Caso B: Usuario Logueado (Dashboard) */
          <div className="w-full max-w-5xl flex flex-col gap-6">
            
            {/* Header del Dashboard */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-800/40 border border-brand-700/30 rounded-2xl p-6">
              <div>
                <p className="text-xs text-gray-400">Sesión iniciada como</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-sm text-white">{userEmail}</span>
                  {isAdmin ? (
                    <span className="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Crown className="w-2.5 h-2.5" />
                      ADMINISTRADOR
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 border border-blue-500/50 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      USUARIO LECTURA
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/40 hover:border-red-800 px-4 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>

            {/* Tabs de navegación para el Admin */}
            {isAdmin && (
              <div className="flex border-b border-brand-800 gap-6 text-sm mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`pb-3 font-bold transition-all relative ${activeTab === 'services' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Gestión de Servicios
                  </span>
                  {activeTab === 'services' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`pb-3 font-bold transition-all relative ${activeTab === 'users' ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gestión de Usuarios y Roles
                  </span>
                  {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />}
                </button>
              </div>
            )}

            {activeTab === 'services' && (
              <>
                {/* Aviso si no hay Supabase conectado */}
                {!isConnected && (
              <div className="bg-yellow-950/25 border border-yellow-800/40 text-yellow-300 rounded-2xl p-5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Modo de Demostración Activo</p>
                    <p className="mt-1 text-gray-400">Los cambios que hagas se guardarán temporalmente en la caché de este navegador (`localStorage`). Configura las variables de entorno en tu archivo `.env` para sincronizar con Supabase en la nube.</p>
                  </div>
                </div>
              </div>
            )}

            {dbError && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl p-4 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dbError}</span>
              </div>
            )}

            {/* Formulario de creación/edición (con REF para foco automático) */}
            {formOpen && (
              <div ref={formRef} className="bg-brand-800/60 border border-brand-700/50 rounded-2xl p-6 relative">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {editingPlan ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
                </h2>
                
                <form onSubmit={handleSubmitPlan} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div>
                    <label className="block text-gray-400 mb-1">Nombre del Servicio</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Netflix Pantalla HD"
                      required
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Plataforma</label>
                    <input
                      type="text"
                      value={plataforma}
                      onChange={(e) => setPlataforma(e.target.value)}
                      placeholder="Ej. Netflix"
                      required
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Precio Mensual ($ COP)</label>
                    <input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(Number(e.target.value))}
                      placeholder="Ej. 12000"
                      required
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-2 font-medium">Categorías del Servicio</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 bg-brand-900/90 border border-brand-800 p-3 rounded-xl">
                      {[
                        { id: 'video', name: 'Cine / Series 🎬' },
                        { id: 'deportes', name: 'Deportes ⚽' },
                        { id: 'musica', name: 'Música 🎵' },
                        { id: 'productividad', name: 'Productividad 💼' },
                        { id: 'combos', name: 'Combos 🌟' }
                      ].map((cat) => {
                        const isChecked = categoriasSeleccionadas.includes(cat.id);
                        return (
                          <label 
                            key={cat.id} 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer select-none ${isChecked ? 'bg-brand-500/20 border-brand-500 text-white font-medium shadow-md shadow-brand-500/10' : 'bg-brand-950/40 border-brand-800 text-gray-450 hover:text-gray-200 hover:bg-brand-950/60'}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isAdmin}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCategoriasSeleccionadas([...categoriasSeleccionadas, cat.id]);
                                } else {
                                  setCategoriasSeleccionadas(categoriasSeleccionadas.filter(id => id !== cat.id));
                                }
                              }}
                              className="rounded bg-brand-900 border-brand-800 text-brand-500 focus:ring-brand-500 w-4 h-4 shrink-0"
                            />
                            <span className="text-xs">{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campo de imagen con opción de URL o Carga Directa (Base64 / Storage) */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1">Imagen de la Tarjeta (FUT card)</label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="text"
                        value={imagen}
                        onChange={(e) => setImagen(e.target.value)}
                        placeholder="Ej. /src/assets/prime_video_completa.webp (o enlace web)"
                        disabled={!isAdmin || loading}
                        className="flex-1 w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                      />
                      <label className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-700 border border-brand-700/60 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold">
                        <Upload className="w-4 h-4 text-brand-400" />
                        <span>Subir Imagen</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={!isAdmin || loading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {imagen && (
                      <div className="mt-3 flex items-center gap-4 bg-brand-900/40 p-2.5 rounded-lg border border-brand-800/60 max-w-sm">
                        <img
                          src={resolverImagen(imagen)}
                          alt="Preview"
                          className="w-12 aspect-[3/4] object-contain bg-brand-900 border border-brand-800 rounded"
                          onError={(e) => { (e.target as HTMLImageElement).src = defaultCardImg; }}
                        />
                        <div className="text-[10px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                          <p className="font-semibold text-gray-400">Vista Previa:</p>
                          <span className="text-[9px]">{imagen.substring(0, 45)}...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1">Descripción Corta</label>
                    <input
                      type="text"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Ej. Cuenta personal con garantía completa 30 días"
                      required
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1">Descripción Detallada / Larga (Opcional - Se mostrará al tocar la tarjeta)</label>
                    <textarea
                      value={descripcionLarga}
                      onChange={(e) => setDescripcionLarga(e.target.value)}
                      placeholder="Ej. Ofrecemos el servicio de Venta de pantallas de Netflix..."
                      disabled={!isAdmin}
                      rows={4}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs resize-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 mb-1">Características (Separadas por comas)</label>
                    <textarea
                      value={caracteristicas}
                      onChange={(e) => setCaracteristicas(e.target.value)}
                      placeholder="Ej. 1 pantalla HD, Garantía total, Entrega inmediata"
                      required
                      disabled={!isAdmin}
                      rows={3}
                      className="w-full px-3 py-2 bg-brand-900/90 border border-brand-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="destacado"
                        checked={destacado}
                        onChange={(e) => setDestacado(e.target.checked)}
                        disabled={!isAdmin}
                        className="rounded bg-brand-900 border-brand-800 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="destacado" className="text-gray-300">Marcar como destacado (TOP)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="agotado"
                        checked={agotado}
                        onChange={(e) => setAgotado(e.target.checked)}
                        disabled={!isAdmin}
                        className="rounded bg-brand-900 border-brand-800 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="agotado" className="text-gray-300 text-red-400 font-semibold">Marcar como AGOTADO</label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="px-5 py-2 rounded-lg bg-brand-900/80 border border-brand-800 hover:bg-brand-900 text-gray-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    {isAdmin && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold"
                      >
                        {loading ? 'Guardando...' : 'Guardar Servicio'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Listado de Servicios */}
            <div className="flex justify-between items-center mt-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Servicios Registrados ({planes.length})
              </h2>
              {isAdmin && !formOpen && (
                <button
                  onClick={openCreateForm}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Servicio
                </button>
              )}
            </div>

            {loading && planes.length === 0 ? (
              <div className="flex justify-center items-center py-20 text-gray-500">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Cargando servicios...
              </div>
            ) : planes.length === 0 ? (
              <div className="text-center py-20 text-gray-500 bg-brand-800/20 border border-brand-700/30 rounded-2xl">
                No hay servicios cargados. Crea uno nuevo para empezar.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentItems.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex justify-between items-center gap-4 bg-brand-800/40 border border-brand-700/30 rounded-2xl p-5 hover:border-brand-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        {/* FUT Card thumbnail */}
                        <div className="w-16 aspect-[3/4] bg-brand-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-brand-800">
                          <img
                            src={resolverImagen(plan.imagen)}
                            alt={plan.nombre}
                            className={`w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${plan.agotado ? 'grayscale opacity-40' : ''}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = defaultCardImg;
                            }}
                          />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-sm line-clamp-1">{plan.nombre}</span>
                            {plan.destacado && (
                              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold px-1.5 py-0.1 rounded-full">
                                TOP
                              </span>
                            )}
                            {plan.agotado && (
                              <span className="bg-red-500/20 border border-red-500/40 text-red-300 text-[9px] font-bold px-1.5 py-0.1 rounded-full">
                                AGOTADO
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{plan.plataforma} · <span className="text-brand-300 font-semibold">${plan.precio.toLocaleString('es-CO')}</span></p>
                          <p className="text-gray-500 text-[10px] mt-1 line-clamp-1">{plan.descripcion}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(plan)}
                          className="p-2 rounded-lg bg-brand-900/80 border border-brand-800 hover:border-brand-600 text-gray-400 hover:text-white transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:bg-red-900/20 hover:border-red-600 text-red-400 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginador de 10 en 10 en Administración */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 bg-brand-900/40 p-4 rounded-2xl border border-brand-800/40">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                      showIcons
                      previousLabel="Anterior"
                      nextLabel="Siguiente"
                      theme={{
                        pages: {
                          base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
                          showIcon: "inline-flex",
                          previous: {
                            base: "ml-0 rounded-l-lg border border-brand-700 bg-brand-900/60 px-3 py-2 leading-tight text-gray-400 hover:bg-brand-800 hover:text-white transition-colors",
                            icon: "h-5 w-5"
                          },
                          next: {
                            base: "rounded-r-lg border border-brand-700 bg-brand-900/60 px-3 py-2 leading-tight text-gray-400 hover:bg-brand-800 hover:text-white transition-colors",
                            icon: "h-5 w-5"
                          },
                          selector: {
                            base: "w-10 border border-brand-700 bg-brand-900/60 py-2 leading-tight text-gray-400 hover:bg-brand-800 hover:text-white transition-colors",
                            active: "bg-brand-500 text-white hover:bg-brand-600 border-brand-500"
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
              </>
            )}

            {/* Panel de Gestión de Usuarios y Roles */}
            {activeTab === 'users' && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center mt-4">
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Gestión de Usuarios y Roles
                  </h2>
                </div>

                {usersError && (
                  <div className="bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl p-4 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{usersError}</span>
                  </div>
                )}

                {loadingUsuarios ? (
                  <div className="flex justify-center items-center py-20 text-gray-500">
                    <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cargando usuarios...
                  </div>
                ) : usuarios.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 bg-brand-800/20 border border-brand-700/30 rounded-2xl">
                    No hay usuarios registrados.
                  </div>
                ) : (
                  <div className="bg-brand-800/40 border border-brand-700/30 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-brand-700 bg-brand-900/50 text-gray-400 font-semibold uppercase tracking-wider">
                            <th className="p-4" style={{ fontFamily: 'Syne, sans-serif' }}>Email</th>
                            <th className="p-4" style={{ fontFamily: 'Syne, sans-serif' }}>Fecha de Registro</th>
                            <th className="p-4 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>Rol</th>
                            <th className="p-4 text-right" style={{ fontFamily: 'Syne, sans-serif' }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-800/50" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {usuarios.map((user) => (
                            <tr key={user.id} className="hover:bg-brand-850/30 transition-colors">
                              <td className="p-4 font-medium text-white">{user.email}</td>
                              <td className="p-4 text-gray-400">
                                {new Date(user.creado_el || user.created_at || Date.now()).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="p-4 text-center">
                                {user.rol === 'admin' ? (
                                  <span className="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                                    <Crown className="w-2.5 h-2.5" />
                                    ADMINISTRADOR
                                  </span>
                                ) : (
                                  <span className="bg-gray-550/20 border border-brand-700/60 text-gray-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                                    USUARIO
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleToggleRole(user.id, user.rol)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-[0.98] ${
                                    user.rol === 'admin'
                                      ? 'bg-red-950/20 border-red-900/40 hover:border-red-600 text-red-400 hover:bg-red-900/10'
                                      : 'bg-brand-500/20 border-brand-500/40 hover:border-brand-500 text-brand-300 hover:bg-brand-500 hover:text-white'
                                  }`}
                                >
                                  {user.rol === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-gray-500 mt-8 pt-4 border-t border-brand-800" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span>© {new Date().getFullYear()} Streaming Chopper. Área de Administración Reservada.</span>
      </footer>
    </div>
  );
}
