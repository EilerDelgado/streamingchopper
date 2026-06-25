import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function IniciarSesion() {
  const navigate = useNavigate();
  const [esRegistro, setEsRegistro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Campos formulario
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si ya hay sesión iniciada
  useEffect(() => {
    async function checkSession() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const { data: perfil } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

          if (perfil?.rol === 'admin') {
            navigate('/admin');
          } else {
            navigate('/perfil');
          }
        } catch (e) {
          navigate('/perfil');
        }
      }
    }
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado.');
      }
      if (esRegistro) {
        // Registrar cliente con Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: nombre,
              rol: 'cliente'
            },
            emailRedirectTo: `${window.location.origin}/perfil`
          }
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session === null) {
          setMensaje('¡Registro exitoso! Por favor verifica tu correo para activar tu cuenta antes de iniciar sesión.');
        } else {
          navigate('/perfil');
        }
      } else {
        // Iniciar Sesión
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          try {
            const { data: perfil } = await supabase
              .from('perfiles')
              .select('rol')
              .eq('id', data.user.id)
              .single();

            if (perfil?.rol === 'admin') {
              navigate('/admin');
            } else {
              navigate('/perfil');
            }
          } catch (e) {
            navigate('/perfil');
          }
        }
      }
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      // Traducir algunos errores comunes de Supabase
      let msg = err.message || 'Ocurrió un error inesperado.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Credenciales de inicio de sesión inválidas. Verifica tu correo y contraseña.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Tu correo electrónico no ha sido confirmado. Revisa tu bandeja de entrada.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este correo electrónico ya está registrado.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Luces y orbes morados de fondo */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Botón Volver */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-6 group"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a la tienda
        </Link>

        {/* Card Principal */}
        <div className="bg-[#141130]/65 border border-white/[0.05] rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {/* Logo y Encabezado */}
          <div className="text-center mb-8">
            <h1 
              className="text-2xl md:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {esRegistro ? 'Crear una Cuenta' : 'Iniciar Sesión'}
            </h1>
            <p 
              className="text-xs text-gray-400 font-light"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {esRegistro ? 'Regístrate para gestionar tu perfil de cliente' : 'Accede a tu cuenta de Streaming Chopper'}
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {esRegistro && (
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
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0c0a1f]/45 border border-white/[0.05] focus:border-brand-500 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Contraseña</label>
                {!esRegistro && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError('Por favor ingresa tu correo electrónico para restablecer tu contraseña.');
                        return;
                      }
                      if (!supabase) {
                        setError('Supabase no está disponible.');
                        return;
                      }
                      setLoading(true);
                      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/perfil`
                      });
                      setLoading(false);
                      if (resetError) {
                        setError(resetError.message);
                      } else {
                        setMensaje('Se ha enviado un enlace de restablecimiento a tu correo.');
                      }
                    }}
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white rounded-2xl py-3.5 font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Procesando...
                </>
              ) : (
                esRegistro ? 'Registrarse' : 'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Toggle Registro/Login */}
          <div 
            className="mt-8 pt-6 border-t border-brand-800/40 text-center text-xs text-gray-400 font-light"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {esRegistro ? (
              <span>
                ¿Ya tienes una cuenta?{' '}
                <button onClick={() => setEsRegistro(false)} className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Inicia Sesión
                </button>
              </span>
            ) : (
              <span>
                ¿No tienes una cuenta?{' '}
                <button onClick={() => setEsRegistro(true)} className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                  Regístrate como cliente
                </button>
              </span>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
