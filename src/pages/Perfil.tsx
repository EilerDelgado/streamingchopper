import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, LogOut, ArrowLeft, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Perfil() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Campos formulario perfil
  const [nombre, setNombre] = useState('');
  
  // Campos formulario cambio de contraseña
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modoRestablecer, setModoRestablecer] = useState(false);

  // Detectar sesión al montar
  useEffect(() => {
    async function loadUser() {
      if (!supabase) {
        navigate('/iniciar-sesion');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirigir a login si no hay sesión
        navigate('/iniciar-sesion');
      } else {
        setUser(session.user);
        setNombre(session.user.user_metadata?.nombre || '');
        
        try {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

          if (perfil?.rol === 'admin') {
            navigate('/admin');
          }
        } catch (e) {
          console.error('Error al validar rol de admin:', e);
        }
      }
    }
    loadUser();

    // Si viene del enlace de recuperación de contraseña, Supabase genera un hash de access_token en la URL
    // o podemos detectar si viene con un hash / query indicativo de reset
    if (window.location.hash.includes('type=recovery') || searchParams.get('reset') === 'true') {
      setModoRestablecer(true);
    }
  }, [navigate, searchParams]);

  // Manejar actualización del nombre
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase no está configurado.');
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { nombre }
      });

      if (updateError) throw updateError;
      if (data.user) {
        setUser(data.user);
        setMensaje('¡Tu perfil ha sido actualizado con éxito!');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Solicitar cambio de contraseña por correo
  const handleRequestPasswordReset = async () => {
    setError(null);
    setMensaje(null);
    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase no está configurado.');
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/perfil?reset=true`
      });

      if (resetError) throw resetError;
      setMensaje('Se ha enviado un enlace de confirmación a tu correo electrónico para cambiar la contraseña.');
    } catch (err: any) {
      setError(err.message || 'Error al solicitar el cambio de contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar nueva contraseña (después de verificación por correo)
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase no está configurado.');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      setMensaje('Contraseña actualizada con éxito.');
      setModoRestablecer(false);
      setPassword('');
      setConfirmarPassword('');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar Sesión
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        <p className="text-sm">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Luces de fondo */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Volver a la tienda */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver a la tienda
          </button>

          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* Card Principal */}
        <div className="bg-[#141130]/65 border border-white/[0.05] rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* Encabezado */}
          <div className="border-b border-brand-800/40 pb-6 mb-8 text-center sm:text-left">
            <h1 
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Tu Cuenta de Cliente
            </h1>
            <p className="text-xs text-gray-400 font-light" style={{ fontFamily: 'Inter, sans-serif' }}>
              Gestiona tu información personal y seguridad
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-800/40 text-green-300 text-xs leading-relaxed">
              {mensaje}
            </div>
          )}

          {/* Formulario de Restablecer Contraseña (si viene de correo de confirmación) */}
          {modoRestablecer ? (
            <form onSubmit={handleSaveNewPassword} className="space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div className="bg-brand-950/20 border border-brand-800/40 p-4 rounded-2xl mb-4">
                <p className="text-xs text-brand-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-brand-400" />
                  Verificación de correo completada
                </p>
                <p className="text-gray-400 text-xs font-light">
                  Ingresa tu nueva contraseña a continuación.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#0c0a1f]/45 border border-white/[0.05] focus:border-brand-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-[#0c0a1f]/45 border border-white/[0.05] focus:border-brand-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-2xl py-3.5 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg"
                >
                  {loading && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                  Guardar Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setModoRestablecer(false)}
                  className="px-6 border border-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.02] rounded-2xl transition-all font-bold text-sm uppercase"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* Formularios de Perfil Normal */
            <div className="space-y-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              
              {/* Sección Datos Personales */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      disabled
                      value={user.email}
                      className="w-full pl-10 pr-4 py-3 bg-[#0c0a1f]/25 border border-white/[0.02] rounded-2xl text-gray-500 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0c0a1f]/45 border border-white/[0.05] focus:border-brand-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-2xl py-3.5 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-brand-500/20"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Actualizar Datos
                </button>
              </form>

              {/* Sección Seguridad / Cambio de Contraseña por Correo */}
              <div className="border-t border-brand-800/40 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Seguridad de la Cuenta
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  Para cambiar tu contraseña, te enviaremos una comprobación segura a tu correo electrónico. Haz clic en el botón inferior para recibir las instrucciones de restablecimiento.
                </p>

                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  disabled={loading}
                  className="w-full py-3.5 border border-brand-700/50 hover:border-brand-500 text-brand-300 hover:text-brand-200 hover:bg-brand-500/10 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cambiar Contraseña por Correo
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}
