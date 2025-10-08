# EducaFET - Plataforma Educativa Digital

![EducaFET Logo](https://img.shields.io/badge/EducaFET-Plataforma%20Educativa-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)

## 📋 Descripción

Plataforma educativa digital desarrollada para la **Fundación Escuela Tecnológica Jesús Oviedo Pérez (FET)** que promueve el aprendizaje autónomo, flexible y accesible. El sistema permite a estudiantes acceder a contenidos educativos de refuerzo, realizar evaluaciones de práctica con retroalimentación inmediata y mantener comunicación académica con docentes.

## 🎯 Objetivos del Proyecto

### Objetivo General
Diseñar una plataforma educativa de refuerzo académico para los estudiantes de la FET que promueva un aprendizaje autónomo, flexible y accesible.

### Objetivos Específicos
- ✅ Identificar y desarrollar las áreas de mayor dificultad académica de los estudiantes
- 🗨️ Implementar herramientas de interacción que fortalezcan la comunicación académica entre estudiantes y docentes
- 📊 Promover el autoaprendizaje mediante evaluaciones de práctica con retroalimentación inmediata

## 🛠️ Tecnologías

### Frontend
- ![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white) **Angular 17+**
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) **TypeScript**
- ![Angular Material](https://img.shields.io/badge/Angular%20Material-009688?style=flat-square&logo=angular&logoColor=white) **Angular Material UI**
- ![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat-square&logo=sass&logoColor=white) **SCSS**

### Backend
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white) **Node.js + Express**
- ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat-square&logo=mysql&logoColor=white) **MySQL**

## 📁 Estructura del Proyecto

```
EducaFET/
├── 📂 frontend/              # Aplicación Angular
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 components/    # Componentes reutilizables
│   │   │   ├── 📂 pages/         # Páginas principales
│   │   │   ├── 📂 services/      # Servicios para API
│   │   │   ├── 📂 guards/        # Guards de autenticación
│   │   │   └── 📂 models/        # Interfaces y modelos
│   │   └── 📂 assets/
│   └── 📄 package.json
├── 📂 backend/               # API Node.js + Express
│   ├── 📂 controllers/       # Controladores de rutas
│   ├── 📂 models/            # Modelos de Sequelize
│   ├── 📂 routes/            # Definición de rutas
│   ├── 📂 middleware/        # Middlewares personalizados
│   ├── 📂 config/            # Configuraciones
│   ├── 📂 utils/             # Utilidades
│   ├── 📄 server.js          # Archivo principal
│   └── 📄 package.json
├── 📄 package.json           # Scripts de desarrollo
└── 📄 README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- ![Node.js](https://img.shields.io/badge/Node.js-v18+-43853D?style=flat-square&logo=node.js&logoColor=white) Node.js 18+
- ![MySQL](https://img.shields.io/badge/MySQL-v8+-005C84?style=flat-square&logo=mysql&logoColor=white) MySQL 8+
- ![Angular CLI](https://img.shields.io/badge/Angular%20CLI-Latest-DD0031?style=flat-square&logo=angular&logoColor=white) Angular CLI
- ![Git](https://img.shields.io/badge/Git-Latest-F05032?style=flat-square&logo=git&logoColor=white) Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/JhonPiDev/EducaFET.git
cd EducaFET
```

### 2. Instalar dependencias
```bash
# Instalar dependencias de ambos proyectos
npm run install:all

# O instalar por separado
npm run install:backend    # Solo backend
npm run install:frontend   # Solo frontend
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE educafet_db;
CREATE USER 'educafet_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON educafet_db.* TO 'educafet_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cd backend
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

**Ejemplo de .env:**
```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=educafet
DB_USER=root
DB_PASS=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# Archivos
MAX_FILE_SIZE=10000000
FILE_UPLOAD_PATH=./uploads
```

### 5. Ejecutar Migraciones
```bash
# para back
cd backend
node index.js

# para front
cd backend
ng serve
```

### 6. Iniciar en Modo Desarrollo
```bash
# Desde la raíz del proyecto - ejecuta ambos servidores
npm run dev

# O ejecutar por separado
npm run dev:backend    # Solo backend (puerto 3000)
npm run dev:frontend   # Solo frontend (puerto 4200)
```

## 🌐 URLs de Desarrollo

| Servicio | URL | Puerto |
|----------|-----|---------|
| 🎨 **Frontend** | http://localhost:4200 | 4200 |
| 🔧 **Backend API** | http://localhost:3000 | 3000 |
| 📊 **Base de Datos** | localhost | 3306 |

## 📚 Funcionalidades Principales

### Para Estudiantes
- 📱 **Dashboard personalizado** con progreso académico
- 📖 **Acceso a contenidos** educativos por materia
- ✅ **Evaluaciones de práctica** con retroalimentación inmediata
- 💬 **Foros de discusión** por curso
- 📊 **Seguimiento de calificaciones** y progreso
- 🔔 **Notificaciones** de actividades y tareas

### Para Docentes
- 👨‍🏫 **Panel de administración** de cursos
- 📝 **Creación y gestión** de contenidos educativos
- 📋 **Sistema de evaluaciones** automatizadas
- 📈 **Reportes y analíticas** de desempeño estudiantil
- 💌 **Comunicación directa** con estudiantes
- 📚 **Biblioteca de recursos** educativos

### Para Administradores
- 🏛️ **Gestión institucional** completa
- 👥 **Administración de usuarios** (estudiantes, docentes)
- 📊 **Reportes estadísticos** institucionales
- ⚙️ **Configuración del sistema**
- 🔒 **Gestión de permisos** y roles


## 📋 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario |
| `POST` | `/api/auth/login` | Inicio de sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/me` | Obtener usuario actual |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/users` | Listar usuarios |
| `GET` | `/api/users/:id` | Obtener usuario por ID |
| `PUT` | `/api/users/:id` | Actualizar usuario |
| `DELETE` | `/api/users/:id` | Eliminar usuario |

### Cursos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/courses` | Listar cursos |
| `POST` | `/api/courses` | Crear curso |
| `GET` | `/api/courses/:id` | Obtener curso por ID |
| `PUT` | `/api/courses/:id` | Actualizar curso |
| `DELETE` | `/api/courses/:id` | Eliminar curso |


## 👥 Autores

- **Juan Felipe Bahamon Castillo** - *Desarrollo Backend *
- **Jhon Esteban Pinto Rodríguez** - *Desarrollo Full Stack*  
- **Carlos Mario Ayala Ceballos** 

*Fundación Escuela Tecnológica Jesús Oviedo Pérez (FET)*  
*Formulación y Evaluación de Proyectos - Semestre VII*

## 🙏 Agradecimientos

- Fundación Escuela Tecnológica Jesús Oviedo Pérez (FET)
- Miguel Antonio Urbano Silva - *Director del Proyecto*
- Comunidad de desarrolladores open source

## 📞 Contacto

- 📧 **Email**: contacto@educafet.edu.co
- 🌐 **Website**: https://www.fet.edu.co
- 📱 **Teléfono**: +57 3112665924

---

<div align="center">

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**

[⬆ Volver al inicio](#educafet---plataforma-educativa-digital)

</div>