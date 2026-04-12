-- Database: visco_fmo

-- DROP DATABASE IF EXISTS visco_fmo;

-- 1. Crear tabla Gerencia
CREATE TABLE gerencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- 2. Crear tabla Jefe de Turno
CREATE TABLE jefe_turno (
    cedula VARCHAR(15) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL
);

-- 3. Crear tabla Departamento
CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion_ceco TEXT,
    centro_costo VARCHAR(50),
    id_gerencia INTEGER REFERENCES gerencia(id),
    id_jefe VARCHAR(15) REFERENCES jefe_turno(cedula)
);

-- 4. Crear tabla Clase Equipo (Periférico, Equipo, Componente, Consumible)
CREATE TABLE clase_equipo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL 
);

-- 5. Crear tabla Responsable
CREATE TABLE responsable (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    id_departamento INTEGER REFERENCES departamento(id)
);

-- 6. Crear tabla Usuario (Login del sistema)
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(15) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    clave VARCHAR(255) NOT NULL -- Almacenar siempre encriptada
);

-- 7. Crear tabla Equipo (La principal del inventario)
CREATE TABLE equipo (
    id SERIAL PRIMARY KEY,
    fmo VARCHAR(20) UNIQUE,
    serial VARCHAR(50) UNIQUE,
    marca VARCHAR(50),
    estado VARCHAR(20), -- Operativo, Dañado, etc.
    tipo VARCHAR(50),
    sub_tipo VARCHAR(50),
    observacion TEXT,
    orden_compra VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,
    id_clase INTEGER REFERENCES clase_equipo(id),
    id_departamento INTEGER REFERENCES departamento(id),
    id_responsable INTEGER REFERENCES responsable(id)
);