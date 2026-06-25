-- =====================================================================
-- ESQUEMA DE BASE DE DATOS PROFESIONAL Y RELACIONAL PARA STREAMING CHOPPER
-- =====================================================================

-- Habilitar la extensión para UUIDs automáticos
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. TABLA: plataformas
-- Guarda las marcas principales de streaming (Netflix, Disney+, Max...)
-- ---------------------------------------------------------------------
create table if not exists public.plataformas (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique,
    logo_url text,
    color_hex varchar(7) default '#4a3293',
    creado_el timestamp with time zone default now()
);

-- ---------------------------------------------------------------------
-- 2. TABLA: categorias
-- Categorías oficiales (video, deportes, musica, productividad, combos)
-- ---------------------------------------------------------------------
create table if not exists public.categorias (
    id varchar(50) primary key, -- ej: 'video', 'musica'
    nombre text not null unique, -- ej: 'Cine y Series 🎬'
    orden integer default 0,
    creado_el timestamp with time zone default now()
);

-- ---------------------------------------------------------------------
-- 3. TABLA BASE: planes_base
-- Contiene la información y estado de los planes de streaming
-- ---------------------------------------------------------------------
create table if not exists public.planes_base (
    id uuid primary key default gen_random_uuid(),
    nombre text not null,
    plataforma_id uuid not null references public.plataformas(id) on delete cascade,
    precio numeric not null check (precio >= 0),
    descripcion text not null,
    descripcion_larga text,
    imagen text,
    caracteristicas text[] default '{}'::text[],
    destacado boolean default false,
    agotado boolean default false,
    created_at timestamp with time zone default now()
);

-- ---------------------------------------------------------------------
-- 4. TABLA INTERMEDIA: plan_categorias (Muchos a Muchos)
-- Relaciona los planes con sus respectivas categorías de filtrado
-- ---------------------------------------------------------------------
create table if not exists public.plan_categorias (
    plan_id uuid not null references public.planes_base(id) on delete cascade,
    categoria_id varchar(50) not null references public.categorias(id) on delete cascade,
    primary key (plan_id, categoria_id)
);

-- =====================================================================
-- CREACIÓN DE ÍNDICES PARA BÚSQUEDA RÁPIDA (OPTIMIZACIÓN DE CONSULTAS)
-- =====================================================================
create index if not exists idx_plataformas_nombre on public.plataformas (nombre);
create index if not exists idx_planes_base_nombre on public.planes_base (nombre);
create index if not exists idx_planes_base_precio on public.planes_base (precio);
create index if not exists idx_planes_base_destacado_agotado on public.planes_base (destacado, agotado);
create index if not exists idx_plan_categorias_categoria on public.plan_categorias (categoria_id);

-- =====================================================================
-- VISTA DE COMPATIBILIDAD CON EL FRONTEND (VIEW: planes)
-- Traduce el diseño relacional a las propiedades planas del modelo en React
-- =====================================================================
create or replace view public.planes with (security_invoker = true) as
select 
    p.id::text as id,
    p.nombre,
    plat.nombre as plataforma,
    p.precio,
    p.descripcion,
    p.descripcion_larga as "descripcionLarga",
    p.imagen,
    coalesce(
        (select array_agg(c.categoria_id) 
         from public.plan_categorias c 
         where c.plan_id = p.id), 
        '{}'::text[]
    ) as categorias,
    coalesce(
        (select c.categoria_id 
         from public.plan_categorias c 
         where c.plan_id = p.id 
         limit 1), 
        'video'
    ) as categoria,
    p.caracteristicas,
    p.destacado,
    p.agotado,
    p.created_at
from public.planes_base p
left join public.plataformas plat on p.plataforma_id = plat.id;

-- =====================================================================
-- DISPARADORES INSTEAD OF (TRIGGERS) PARA LA VISTA WRITEABLE
-- Permite que inserts, updates y deletes en la vista se guarden relacionalmente
-- =====================================================================

-- 1. TRIGGER DE INSERCIÓN
create or replace function public.on_insert_planes_view()
returns trigger as $$
declare
    v_plataforma_id uuid;
    v_plan_id uuid;
    v_cat_id text;
begin
    -- Buscar o registrar plataforma
    select id into v_plataforma_id 
    from public.plataformas 
    where lower(nombre) = lower(new.plataforma);
    
    if v_plataforma_id is null then
        insert into public.plataformas (nombre)
        values (new.plataforma)
        returning id into v_plataforma_id;
    end if;

    -- Registrar plan base
    insert into public.planes_base (
        id,
        nombre,
        plataforma_id,
        precio,
        descripcion,
        descripcion_larga,
        imagen,
        caracteristicas,
        destacado,
        agotado
    )
    values (
        coalesce(new.id::uuid, gen_random_uuid()),
        new.nombre,
        v_plataforma_id,
        new.precio,
        new.descripcion,
        new."descripcionLarga",
        new.imagen,
        coalesce(new.caracteristicas, '{}'::text[]),
        coalesce(new.destacado, false),
        coalesce(new.agotado, false)
    )
    returning id into v_plan_id;

    -- Registrar categorías asociadas
    if new.categorias is not null then
        foreach v_cat_id in array new.categorias loop
            -- Asegurar existencia de la categoría
            if not exists (select 1 from public.categorias where id = v_cat_id) then
                insert into public.categorias (id, nombre)
                values (v_cat_id, initcap(v_cat_id));
            end if;
            
            insert into public.plan_categorias (plan_id, categoria_id)
            values (v_plan_id, v_cat_id)
            on conflict do nothing;
        end loop;
    else
        -- Por defecto vincular a la categoría principal si viene nulo
        if not exists (select 1 from public.categorias where id = new.categoria) then
            insert into public.categorias (id, nombre)
            values (new.categoria, initcap(new.categoria));
        end if;
        insert into public.plan_categorias (plan_id, categoria_id)
        values (v_plan_id, new.categoria)
        on conflict do nothing;
    end if;

    return new;
end;
$$ language plpgsql;

create or replace trigger trigger_insert_planes_view
instead of insert on public.planes
for each row
execute function public.on_insert_planes_view();

-- 2. TRIGGER DE ACTUALIZACIÓN
create or replace function public.on_update_planes_view()
returns trigger as $$
declare
    v_plataforma_id uuid;
    v_cat_id text;
begin
    -- Buscar o registrar plataforma
    select id into v_plataforma_id 
    from public.plataformas 
    where lower(nombre) = lower(new.plataforma);
    
    if v_plataforma_id is null then
        insert into public.plataformas (nombre)
        values (new.plataforma)
        returning id into v_plataforma_id;
    end if;

    -- Actualizar plan base
    update public.planes_base
    set
        nombre = new.nombre,
        plataforma_id = v_plataforma_id,
        precio = new.precio,
        descripcion = new.descripcion,
        descripcion_larga = new."descripcionLarga",
        imagen = new.imagen,
        caracteristicas = coalesce(new.caracteristicas, '{}'::text[]),
        destacado = coalesce(new.destacado, false),
        agotado = coalesce(new.agotado, false)
    where id = old.id::uuid;

    -- Sincronizar categorías asociadas
    delete from public.plan_categorias where plan_id = old.id::uuid;

    if new.categorias is not null then
        foreach v_cat_id in array new.categorias loop
            if not exists (select 1 from public.categorias where id = v_cat_id) then
                insert into public.categorias (id, nombre)
                values (v_cat_id, initcap(v_cat_id));
            end if;
            
            insert into public.plan_categorias (plan_id, categoria_id)
            values (old.id::uuid, v_cat_id)
            on conflict do nothing;
        end loop;
    else
        if not exists (select 1 from public.categorias where id = new.categoria) then
            insert into public.categorias (id, nombre)
            values (new.categoria, initcap(new.categoria));
        end if;
        insert into public.plan_categorias (plan_id, categoria_id)
        values (old.id::uuid, new.categoria)
        on conflict do nothing;
    end if;

    return new;
end;
$$ language plpgsql;

create or replace trigger trigger_update_planes_view
instead of update on public.planes
for each row
execute function public.on_update_planes_view();

-- 3. TRIGGER DE ELIMINACIÓN
create or replace function public.on_delete_planes_view()
returns trigger as $$
begin
    delete from public.planes_base where id = old.id::uuid;
    return old;
end;
$$ language plpgsql;

create or replace trigger trigger_delete_planes_view
instead of delete on public.planes
for each row
execute function public.on_delete_planes_view();

-- =====================================================================
-- 5. TABLA: perfiles Y CONTROL DE ROLES (ADMIN / USER)
-- =====================================================================
create table if not exists public.perfiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    rol text not null default 'user' check (rol in ('user', 'admin')),
    creado_el timestamp with time zone default now()
);

-- Sincronizar usuarios existentes en auth.users a public.perfiles por si acaso
insert into public.perfiles (id, email, rol)
select id, email, 'user'
from auth.users
on conflict (id) do nothing;

-- Función de seguridad para comprobar si un usuario es admin (evita recursión en RLS)
create or replace function public.es_admin(user_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 from public.perfiles
        where id = user_id and rol = 'admin'
    );
end;
-- security definer hace que la función se ejecute con privilegios del creador (bypass RLS interno)
$$ language plpgsql security definer;

-- Función y trigger para crear automáticamente el perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.perfiles (id, email, rol)
    values (new.id, new.email, 'user');
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- =====================================================================
-- CONFIGURACIÓN DE SEGURIDAD (ROW LEVEL SECURITY - RLS) EN TABLAS BASE
-- =====================================================================
alter table public.plataformas enable row level security;
alter table public.categorias enable row level security;
alter table public.planes_base enable row level security;
alter table public.plan_categorias enable row level security;
alter table public.perfiles enable row level security;

-- Políticas de Lectura Pública
create policy "Lectura pública de plataformas" on public.plataformas for select using (true);
create policy "Lectura pública de categorias" on public.categorias for select using (true);
create policy "Lectura pública de planes_base" on public.planes_base for select using (true);
create policy "Lectura pública de plan_categorias" on public.plan_categorias for select using (true);
create policy "Lectura de perfiles propia o por admin" on public.perfiles for select 
    using (auth.uid() = id or public.es_admin(auth.uid()));

-- Políticas de Escritura Admin (Solo Administradores Autenticados con rol = 'admin')
create policy "Escritura admin de plataformas" on public.plataformas for all to authenticated 
    using (public.es_admin(auth.uid()));
create policy "Escritura admin de categorias" on public.categorias for all to authenticated 
    using (public.es_admin(auth.uid()));
create policy "Escritura admin de planes_base" on public.planes_base for all to authenticated 
    using (public.es_admin(auth.uid()));
create policy "Escritura admin de plan_categorias" on public.plan_categorias for all to authenticated 
    using (public.es_admin(auth.uid()));
create policy "Escritura admin de perfiles" on public.perfiles for all to authenticated 
    using (public.es_admin(auth.uid()));

-- =====================================================================
-- PREPARAR ESTRUCTURA DE CATEGORÍAS POR DEFECTO
-- =====================================================================
insert into public.categorias (id, nombre, orden) values
('video', 'Cine y Series 🎬', 1),
('deportes', 'Deportes ⚽', 2),
('musica', 'Música y Audio 🎵', 3),
('productividad', 'Herramientas y Productividad 💼', 4),
('combos', 'Combos Especiales 🌟', 5)
on conflict (id) do update set nombre = excluded.nombre, orden = excluded.orden;
