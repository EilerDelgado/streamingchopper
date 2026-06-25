# Streaming Chopper 🛸

¡Bienvenido a **Streaming Chopper**! Esta es una tienda virtual moderna, responsiva y muy visual diseñada para la venta y distribución de cuentas de plataformas de streaming (como Netflix, Disney+, Max, Prime Video, Spotify y más). 

El sitio está estructurado como una landing page atractiva y premium que permite a los clientes explorar tu catálogo y realizar sus pedidos de forma ágil y directa.

---

## ✨ Características Principales

### 🎨 Para tus Clientes (Diseño y Compra)
* **Diseño Premium y Responsivo**: Colores vibrantes (morados de marca), tarjetas flotantes y animaciones sutiles que se ven perfectas tanto en computadoras como en teléfonos móviles.
* **Tarjetas estilo FIFA FUT**: Los productos se muestran de forma atractiva con sus imágenes físicas o enlaces web directamente en formato de tarjeta coleccionable.
* **Buscador y Categorías Interactivos**: Filtra los planes al instante (Cine/Series 🎬, Deportes ⚽, Música 🎵, Productividad 💼 y Combos 🌟) o realiza búsquedas por nombre de plataforma.
* **Carrito Multiproducto**: Permite seleccionar varias cuentas o planes a la vez, ajustar las cantidades y ver el total a pagar.
* **Compra Rápida por WhatsApp**: Al dar clic en comprar, el sistema genera automáticamente un mensaje ordenado y detallado con todo el pedido para que el cliente te contacte directamente por WhatsApp en un solo clic.

### 🔐 Registro y Perfil de Clientes
* **Inicio de Sesión**: Los usuarios pueden registrarse como clientes para gestionar su cuenta.
* **Panel de Perfil**: Permite modificar su nombre completo de forma sencilla.
* **Cambio de Contraseña Seguro**: Si el cliente desea cambiar su contraseña, recibirá un correo electrónico de confirmación seguro para verificar su identidad antes de realizar el cambio.
* **Visualizador de Contraseñas**: Incluye botones en forma de ojo para mostrar u ocultar los caracteres mientras digitan contraseñas.

### 🛠️ Para el Administrador (Consola Web)
* **Consola de Administración `/admin`**: Un panel privado desde el cual puedes crear nuevos planes, cambiar precios, marcar productos como destacados (insignia TOP) o marcarlos como **Agotados** cuando te quedes sin stock.
* **Base de Datos en Tiempo Real**: Todo el catálogo se guarda y lee directamente en la nube usando Supabase. Si actualizas un precio en el panel, cambia al instante en la tienda sin necesidad de modificar el código de la página.

---

## 🚀 ¿Cómo poner en marcha el proyecto?

### 1. Preparar las Herramientas
Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu computadora.

### 2. Instalar Dependencias
Abre la carpeta del proyecto en tu terminal y escribe:
```bash
npm install
```

### 3. Configurar la Base de Datos (Supabase)
1. Crea un proyecto gratuito en [Supabase](https://supabase.com/).
2. Copia todo el contenido del archivo `supabase_schema.sql` (que se encuentra en la carpeta principal del proyecto).
3. En tu panel de Supabase, ve a **SQL Editor**, crea una nueva consulta (**New Query**), pega el código y haz clic en **Run** para crear la estructura de las tablas de forma automática.

### 4. Configurar las Variables de Entorno
1. Duplica el archivo `.env.example` y cámbiale el nombre a `.env`.
2. Pega la URL de tu proyecto de Supabase y la clave pública anónima (Anon Key) en sus respectivos campos.

### 5. Iniciar la Tienda Localmente
Para ver y probar la página en tu navegador, ejecuta:
```bash
npm run dev
```
Haz clic en el enlace que aparece en la terminal (por ejemplo, `http://localhost:5173`) y ¡listo!

---

*Desarrollado con pasión para Streaming Chopper.* 💜
