--
-- PostgreSQL database dump
--

\restrict khvx9RIbskyv7pCMXpNxeM9CMucrcBFfqxVWwidFTbVZQT7EnyKvTbAITfwa2Km

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-06-19 06:03:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 24861)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id integer NOT NULL,
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
    campo_modificado character varying(50),
    valor_anterior text,
    valor_nuevo text,
    tipo_equipo character varying(50)
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24860)
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_seq OWNER TO postgres;

--
-- TOC entry 5000 (class 0 OID 0)
-- Dependencies: 233
-- Name: auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_id_seq OWNED BY public.auditoria.id;


--
-- TOC entry 219 (class 1259 OID 24721)
-- Name: clase_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clase_equipo (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.clase_equipo OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24726)
-- Name: clase_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clase_equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clase_equipo_id_seq OWNER TO postgres;

--
-- TOC entry 5001 (class 0 OID 0)
-- Dependencies: 220
-- Name: clase_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clase_equipo_id_seq OWNED BY public.clase_equipo.id;


--
-- TOC entry 221 (class 1259 OID 24727)
-- Name: departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamento (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    centro_costo character varying(50),
    id_gerencia integer
);


ALTER TABLE public.departamento OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24732)
-- Name: departamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamento_id_seq OWNER TO postgres;

--
-- TOC entry 5002 (class 0 OID 0)
-- Dependencies: 222
-- Name: departamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamento_id_seq OWNED BY public.departamento.id;


--
-- TOC entry 223 (class 1259 OID 24733)
-- Name: equipo; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.equipo OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24740)
-- Name: equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipo_id_seq OWNER TO postgres;

--
-- TOC entry 5003 (class 0 OID 0)
-- Dependencies: 224
-- Name: equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipo_id_seq OWNED BY public.equipo.id;


--
-- TOC entry 227 (class 1259 OID 24748)
-- Name: gerencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gerencia (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.gerencia OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24753)
-- Name: gerencia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gerencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gerencia_id_seq OWNER TO postgres;

--
-- TOC entry 5004 (class 0 OID 0)
-- Dependencies: 228
-- Name: gerencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gerencia_id_seq OWNED BY public.gerencia.id;


--
-- TOC entry 225 (class 1259 OID 24741)
-- Name: imagen_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imagen_equipo (
    id integer NOT NULL,
    id_equipo integer NOT NULL,
    ruta_archivo character varying(255) NOT NULL,
    tipo_documento character varying(100)
);


ALTER TABLE public.imagen_equipo OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24747)
-- Name: imagen_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.imagen_equipo ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.imagen_equipo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 24760)
-- Name: responsable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.responsable (
    id integer NOT NULL,
    cedula character varying(15) NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    id_departamento integer
);


ALTER TABLE public.responsable OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24767)
-- Name: responsable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.responsable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.responsable_id_seq OWNER TO postgres;

--
-- TOC entry 5005 (class 0 OID 0)
-- Dependencies: 230
-- Name: responsable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.responsable_id_seq OWNED BY public.responsable.id;


--
-- TOC entry 231 (class 1259 OID 24768)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24778)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO postgres;

--
-- TOC entry 5006 (class 0 OID 0)
-- Dependencies: 232
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 4797 (class 2604 OID 24864)
-- Name: auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id SET DEFAULT nextval('public.auditoria_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 24779)
-- Name: clase_equipo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_equipo ALTER COLUMN id SET DEFAULT nextval('public.clase_equipo_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 24780)
-- Name: departamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id SET DEFAULT nextval('public.departamento_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24781)
-- Name: equipo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo ALTER COLUMN id SET DEFAULT nextval('public.equipo_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 24782)
-- Name: gerencia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerencia ALTER COLUMN id SET DEFAULT nextval('public.gerencia_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 24783)
-- Name: responsable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable ALTER COLUMN id SET DEFAULT nextval('public.responsable_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 24784)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 4994 (class 0 OID 24861)
-- Dependencies: 234
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria (id, operacion, id_equipo, id_usuario, nombre_usuario, fecha, fmo, serial_equipo, marca_equipo, modelo_equipo, clase_equipo, campo_modificado, valor_anterior, valor_nuevo, tipo_equipo) FROM stdin;
2	INSERT	\N	4	Mauricio Arismendi	2026-05-25 04:31:00.104285	123	678	dell	ss	equipo	\N	\N	\N	\N
3	UPDATE	\N	4	Mauricio Arismendi	2026-05-25 04:31:29.983882	123	678	dell	ss	equipo	Departamento	1	2	\N
4	UPDATE	\N	4	Mauricio Arismendi	2026-05-25 04:31:57.465725	123	678	dell	ssTTT	equipo	Modelo	ss	ssTTT	\N
6	INSERT	\N	4	Mauricio Arismendi	2026-05-25 04:51:57.50219	123	678	dell	ss	equipo	\N	\N	\N	\N
7	DELETE	\N	4	Mauricio Arismendi	2026-05-25 04:52:28.330747	123	678	dell	ss	equipo	\N	\N	\N	\N
8	INSERT	21	4	Mauricio Arismendi	2026-05-25 13:49:21.717111	123	678	dell	ss	periferico	\N	\N	\N	\N
9	UPDATE	21	4	Mauricio Arismendi	2026-05-25 13:56:38.136506	123	678	dell	ss	periferico	Responsable	fermin gomez	Mauricio Arismendi	\N
10	INSERT	23	4	Mauricio Arismendi	2026-05-25 14:00:43.302603	1234	6784	dell	ss	equipo	\N	\N	\N	\N
11	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:02:48.702795	1234	6784	dell	ss	equipo	Estado	Asignado	Almacen	\N
12	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:37:34.269658	1234	6784	dell	ss	equipo	Departamento	Soporte Técnico	Seguridad	gg
13	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:43:40.235183	1234	6784	dell	popos	equipo	Modelo	ss	popos	gg
14	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:43:40.239922	1234	6784	dell	popos	equipo	Departamento	Seguridad	Recursos humanos	gg
15	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:47:56.04996	5656	6784	dell	popos	periferico	FMO	1234	5656	laptoop
16	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:47:56.053824	5656	6784	dell	popos	periferico	Tipo	gg	laptoop	laptoop
17	UPDATE	23	4	Mauricio Arismendi	2026-05-25 14:47:56.057931	5656	6784	dell	popos	periferico	Clase	equipo	periferico	laptoop
\.


--
-- TOC entry 4979 (class 0 OID 24721)
-- Dependencies: 219
-- Data for Name: clase_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clase_equipo (id, nombre) FROM stdin;
1	PC
2	g
3	equipo
4	periferico
5	TECLADO
6	COMPUTACION
\.


--
-- TOC entry 4981 (class 0 OID 24727)
-- Dependencies: 221
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamento (id, nombre, centro_costo, id_gerencia) FROM stdin;
1	Soporte Técnico	CECO-IT-001	1
2	Recursos humanos	\N	2
3	Seguridad	3564743	3
\.


--
-- TOC entry 4983 (class 0 OID 24733)
-- Dependencies: 223
-- Data for Name: equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipo (id, fmo, serial, marca, estado, tipo, observacion, orden_compra, fecha_registro, fecha_modificacion, id_clase, id_departamento, id_responsable, id_usuario, modelo) FROM stdin;
21	123	678	dell	Asignado	gg	\N	\N	2026-05-25 13:49:21.567215	2026-05-25 13:56:38.120884	4	1	1	4	ss
23	5656	6784	dell	Almacen	laptoop	jj	\N	2026-05-25 14:00:43.296156	2026-05-25 14:47:56.032532	4	2	3	4	popos
\.


--
-- TOC entry 4987 (class 0 OID 24748)
-- Dependencies: 227
-- Data for Name: gerencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gerencia (id, nombre) FROM stdin;
1	Gerencia de Telematica
2	Talento Humano
3	Gerencia General
\.


--
-- TOC entry 4985 (class 0 OID 24741)
-- Dependencies: 225
-- Data for Name: imagen_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imagen_equipo (id, id_equipo, ruta_archivo, tipo_documento) FROM stdin;
\.


--
-- TOC entry 4989 (class 0 OID 24760)
-- Dependencies: 229
-- Data for Name: responsable; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.responsable (id, cedula, nombre, apellido, id_departamento) FROM stdin;
1	V-30820542	Mauricio	Arismendi	1
2	v-30999999	luis	lopez	2
3	30912333	fermin	gomez	3
\.


--
-- TOC entry 4991 (class 0 OID 24768)
-- Dependencies: 231
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, cedula, nombre, apellido, clave, rol, usuario_nombre) FROM stdin;
1	30820542	mauro	arismendi	mau	\N	mauro
2	12007888	mario	martinez	lol	admin	mario
3	30912333	luis	gomez	$2b$10$cWwx4xtFiFZ9uXbzhmM23u.JbODrb0cdY6YfA1pRljlbboBeUAgN.	usuario	luis123
4	123	Mauricio	Arismendi	$2b$10$mKAma6o0sDbZYpJbY.iQL.zk7LjInfvH0BaTYTYrkNeJ.vWdFpWlG	admin	mauro123
\.


--
-- TOC entry 5007 (class 0 OID 0)
-- Dependencies: 233
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 17, true);


--
-- TOC entry 5008 (class 0 OID 0)
-- Dependencies: 220
-- Name: clase_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clase_equipo_id_seq', 6, true);


--
-- TOC entry 5009 (class 0 OID 0)
-- Dependencies: 222
-- Name: departamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamento_id_seq', 3, true);


--
-- TOC entry 5010 (class 0 OID 0)
-- Dependencies: 224
-- Name: equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipo_id_seq', 23, true);


--
-- TOC entry 5011 (class 0 OID 0)
-- Dependencies: 228
-- Name: gerencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gerencia_id_seq', 3, true);


--
-- TOC entry 5012 (class 0 OID 0)
-- Dependencies: 226
-- Name: imagen_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imagen_equipo_id_seq', 1, true);


--
-- TOC entry 5013 (class 0 OID 0)
-- Dependencies: 230
-- Name: responsable_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.responsable_id_seq', 3, true);


--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 232
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 4, true);


--
-- TOC entry 4822 (class 2606 OID 24871)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 24786)
-- Name: clase_equipo clase_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clase_equipo
    ADD CONSTRAINT clase_equipo_pkey PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 24788)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id);


--
-- TOC entry 4804 (class 2606 OID 24790)
-- Name: equipo equipo_fmo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_fmo_key UNIQUE (fmo);


--
-- TOC entry 4806 (class 2606 OID 24792)
-- Name: equipo equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 24794)
-- Name: equipo equipo_serial_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_serial_key UNIQUE (serial);


--
-- TOC entry 4810 (class 2606 OID 24796)
-- Name: gerencia gerencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerencia
    ADD CONSTRAINT gerencia_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 24800)
-- Name: responsable responsable_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_cedula_key UNIQUE (cedula);


--
-- TOC entry 4814 (class 2606 OID 24802)
-- Name: responsable responsable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 24804)
-- Name: usuario unique_usuario_nombre; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT unique_usuario_nombre UNIQUE (usuario_nombre);


--
-- TOC entry 4818 (class 2606 OID 24806)
-- Name: usuario usuario_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_cedula_key UNIQUE (cedula);


--
-- TOC entry 4820 (class 2606 OID 24808)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 4830 (class 2606 OID 24872)
-- Name: auditoria auditoria_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id) ON DELETE SET NULL;


--
-- TOC entry 4831 (class 2606 OID 24877)
-- Name: auditoria auditoria_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- TOC entry 4823 (class 2606 OID 24819)
-- Name: departamento departamento_id_gerencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_id_gerencia_fkey FOREIGN KEY (id_gerencia) REFERENCES public.gerencia(id);


--
-- TOC entry 4824 (class 2606 OID 24829)
-- Name: equipo equipo_id_clase_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_clase_fkey FOREIGN KEY (id_clase) REFERENCES public.clase_equipo(id);


--
-- TOC entry 4825 (class 2606 OID 24834)
-- Name: equipo equipo_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id);


--
-- TOC entry 4826 (class 2606 OID 24839)
-- Name: equipo equipo_id_responsable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_responsable_fkey FOREIGN KEY (id_responsable) REFERENCES public.responsable(id);


--
-- TOC entry 4827 (class 2606 OID 24844)
-- Name: equipo equipo_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipo
    ADD CONSTRAINT equipo_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id);


--
-- TOC entry 4828 (class 2606 OID 24849)
-- Name: imagen_equipo imagen_equipo_id_equipo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagen_equipo
    ADD CONSTRAINT imagen_equipo_id_equipo_fkey FOREIGN KEY (id_equipo) REFERENCES public.equipo(id) ON DELETE CASCADE;


--
-- TOC entry 4829 (class 2606 OID 24854)
-- Name: responsable responsable_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.responsable
    ADD CONSTRAINT responsable_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id);


-- Completed on 2026-06-19 06:03:32

--
-- PostgreSQL database dump complete
--

\unrestrict khvx9RIbskyv7pCMXpNxeM9CMucrcBFfqxVWwidFTbVZQT7EnyKvTbAITfwa2Km

