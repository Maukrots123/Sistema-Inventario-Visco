--
-- PostgreSQL database dump
--

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-29 14:28:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path TO public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

-- Eliminar tablas si existen (orden inverso a dependencias)
DROP TABLE IF EXISTS public.imagen_equipo CASCADE;
DROP TABLE IF EXISTS public.auditoria CASCADE;
DROP TABLE IF EXISTS public.equipo CASCADE;
DROP TABLE IF EXISTS public.responsable CASCADE;
DROP TABLE IF EXISTS public.departamento CASCADE;
DROP TABLE IF EXISTS public.jefe_turno CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
DROP TABLE IF EXISTS public.clase_equipo CASCADE;
DROP TABLE IF EXISTS public.gerencia CASCADE;

--
-- TOC entry 232 (class 1259 OID 16506)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id SERIAL PRIMARY KEY,
    operacion character varying(10) NOT NULL,
    id_equipo integer,
    id_usuario integer,
    nombre_usuario character varying(100),
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fmo character varying(20),
    serial_equipo character varying(50),
    marca_equipo character varying(50),
    modelo_equipo character varying(50),
    clase_equipo character varying(50),
    tipo_equipo character varying(50),
    campo_modificado character varying(50),
    valor_anterior text,
    valor_nuevo text
);


--
-- TOC entry 225 (class 1259 OID 16428)
-- Name: clase_equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clase_equipo (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 16427)
-- Name: clase_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clase_equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 224
-- Name: clase_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clase_equipo_id_seq OWNED BY public.clase_equipo.id;


--
-- TOC entry 223 (class 1259 OID 16407)
-- Name: departamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departamento (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    centro_costo character varying(50),
    id_gerencia integer,
    id_jefe character varying(15)
);


--
-- TOC entry 222 (class 1259 OID 16406)
-- Name: departamento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 222
-- Name: departamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departamento_id_seq OWNED BY public.departamento.id;


--
-- TOC entry 231 (class 1259 OID 16469)
-- Name: equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.equipo (
    id integer NOT NULL,
    fmo character varying(20),
    serial character varying(50),
    marca character varying(50),
    estado character varying(20),
    tipo character varying(50),
    observacion text,
    orden_compra character varying(50),
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion timestamp without time zone,
    id_clase integer,
    id_departamento integer,
    id_responsable integer,
    id_usuario integer,
    modelo character varying(50)
);


--
-- TOC entry 230 (class 1259 OID 16468)
-- Name: equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 230
-- Name: equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.equipo_id_seq OWNED BY public.equipo.id;


--
-- Name: imagen_equipo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imagen_equipo (
    id integer NOT NULL,
    id_equipo integer NOT NULL,
    ruta_archivo character varying(255) NOT NULL,
    tipo_documento character varying(100)
);


ALTER TABLE public.imagen_equipo ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: gerencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gerencia (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: gerencia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gerencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 219
-- Name: gerencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gerencia_id_seq OWNED BY public.gerencia.id;


--
-- TOC entry 221 (class 1259 OID 16398)
-- Name: jefe_turno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jefe_turno (
    cedula character varying(15) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16437)
-- Name: responsable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responsable (
    id integer NOT NULL,
    cedula character varying(15) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    id_departamento integer
);


--
-- TOC entry 226 (class 1259 OID 16436)
-- Name: responsable_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.responsable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 226
-- Name: responsable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.responsable_id_seq OWNED BY public.responsable.id;


--
-- TOC entry 229 (class 1259 OID 16455)
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    cedula character varying(15) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    clave character varying(255) NOT NULL,
    rol character varying(30),
    usuario_nombre character varying
);


--
-- TOC entry 228 (class 1259 OID 16454)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 228
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 4891 (class 2604 OID 16431)
-- Name: clase_equipo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clase_equipo ALTER COLUMN id SET DEFAULT nextval('public.clase_equipo_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 16410)
-- Name: departamento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id SET DEFAULT nextval('public.departamento_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 16472)
-- Name: equipo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo ALTER COLUMN id SET DEFAULT nextval('public.equipo_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 16393)
-- Name: gerencia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gerencia ALTER COLUMN id SET DEFAULT nextval('public.gerencia_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 16440)
-- Name: responsable id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsable ALTER COLUMN id SET DEFAULT nextval('public.responsable_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 16458)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 5089 (class 0 OID 16506)
-- Dependencies: 232
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

-- No hay datos para auditoria


--
-- TOC entry 5082 (class 0 OID 16428)
-- Dependencies: 225
-- Data for Name: clase_equipo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.clase_equipo (id, nombre) VALUES
(1, 'PC'),
(2, 'g'),
(3, 'equipo'),
(4, 'periferico'),
(5, 'TECLADO');


--
-- TOC entry 5080 (class 0 OID 16407)
-- Dependencies: 223
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.departamento (id, nombre, centro_costo, id_gerencia, id_jefe) VALUES
(1, 'Soporte Técnico', '123456', 1, NULL),
(2, 'Recursos humanos', NULL, 2, NULL),
(3, 'Seguridad', '3564743', 3, NULL);



--
-- TOC entry 5088 (class 0 OID 16469)
-- Dependencies: 231
-- Data for Name: equipo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.equipo (id, fmo, serial, marca, estado, tipo, observacion, orden_compra, fecha_registro, fecha_modificacion, id_clase, id_departamento, id_responsable, modelo) VALUES
(17, '123', '678', 'dell', 'Asignado', 'gg', '', NULL, '2026-04-28 19:58:23.109881', '2026-04-28 19:58:23.109881', 5, 3, 2, NULL);


--
-- TOC entry 5077 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: gerencia; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.gerencia (id, nombre) VALUES
(1, 'Gerencia de Telematica'),
(2, 'Talento Humano'),
(3, 'Gerencia General');


--
-- TOC entry 5078 (class 0 OID 16398)
-- Dependencies: 221
-- Data for Name: jefe_turno; Type: TABLE DATA; Schema: public; Owner: -
--

-- No hay datos para jefe_turno


--
-- TOC entry 5084 (class 0 OID 16437)
-- Dependencies: 227
-- Data for Name: responsable; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.responsable (id, cedula, nombre, apellido, id_departamento) VALUES
(1, 'V-30820542', 'Mauricio', 'Arismendi', 1),
(2, 'v-30999999', 'luis', 'lopez', 2),
(3, '30912333', 'fermin', 'gomez', 3);


--
-- TOC entry 5086 (class 0 OID 16455)
-- Dependencies: 229
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuario (id, cedula, nombre, apellido, clave, rol, usuario_nombre) VALUES
(1, '30820542', 'mauro', 'arismendi', 'mau', NULL, 'mauro'),
(2, '12007888', 'mario', 'martinez', 'lol', 'admin', 'mario'),
(3, '30912333', 'luis', 'gomez', '$2b$10$cWwx4xtFiFZ9uXbzhmM23u.JbODrb0cdY6YfA1pRljlbboBeUAgN.', 'usuario', 'luis123');


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 224
-- Name: clase_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clase_equipo_id_seq', 5, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 222
-- Name: departamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departamento_id_seq', 3, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 230
-- Name: equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.equipo_id_seq', 17, true);


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 219
-- Name: gerencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gerencia_id_seq', 3, true);


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 226
-- Name: responsable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.responsable_id_seq', 3, true);


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 228
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_seq', 3, true);


--
-- TOC entry 4904 (class 2606 OID 16435)
-- Name: clase_equipo clase_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clase_equipo
    ADD CONSTRAINT clase_equipo_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 16416)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id);


--
-- TOC entry 4916 (class 2606 OID 16480)
-- Name: equipo equipo_fmo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_fmo_key UNIQUE (fmo);


--
-- TOC entry 4918 (class 2606 OID 16478)
-- Name: equipo equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 16482)
-- Name: equipo equipo_serial_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_serial_key UNIQUE (serial);


--
-- TOC entry 4898 (class 2606 OID 16397)
-- Name: gerencia gerencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gerencia
    ADD CONSTRAINT gerencia_pkey PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 16405)
-- Name: jefe_turno jefe_turno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jefe_turno
    ADD CONSTRAINT jefe_turno_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4906 (class 2606 OID 16448)
-- Name: responsable responsable_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_cedula_key UNIQUE (cedula);


--
-- TOC entry 4908 (class 2606 OID 16446)
-- Name: responsable responsable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 16530)
-- Name: usuario unique_usuario_nombre; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT unique_usuario_nombre UNIQUE (usuario_nombre);


--
-- TOC entry 4912 (class 2606 OID 16467)
-- Name: usuario usuario_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_cedula_key UNIQUE (cedula);


--
-- TOC entry 4914 (class 2606 OID 16465)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 16516)
-- Name: auditoria auditoria_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id) ON DELETE SET NULL;


--
-- TOC entry 4928 (class 2606 OID 16521)
-- Name: auditoria auditoria_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- TOC entry 4921 (class 2606 OID 16417)
-- Name: departamento departamento_id_gerencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_id_gerencia_fkey FOREIGN KEY (id_gerencia) REFERENCES public.gerencia(id);


--
-- TOC entry 4922 (class 2606 OID 16422)
-- Name: departamento departamento_id_jefe_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_id_jefe_fkey FOREIGN KEY (id_jefe) REFERENCES public.jefe_turno(cedula);


--
-- TOC entry 4924 (class 2606 OID 16483)
-- Name: equipo equipo_id_clase_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_clase_fkey FOREIGN KEY (id_clase) REFERENCES public.clase_equipo(id);


--
-- TOC entry 4925 (class 2606 OID 16488)
-- Name: equipo equipo_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id);


--
-- TOC entry 4926 (class 2606 OID 16493)
-- Name: equipo equipo_id_responsable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES public.responsable(id);


--
-- TOC entry 4929 (class 2606 OID 16522)
-- Name: equipo equipo_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);

--
-- Name: imagen_equipo imagen_equipo_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imagen_equipo
    ADD CONSTRAINT imagen_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 16449)
-- Name: responsable responsable_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id);


-- Completed on 2026-04-29 14:28:21

--
-- PostgreSQL database dump complete
--


