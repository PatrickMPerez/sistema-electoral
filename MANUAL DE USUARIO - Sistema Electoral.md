# MANUAL DE USUARIO
# Sistema Electoral

**Versión 1.0 — Abril 2026**

---

## ÍNDICE

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Roles de Usuario](#2-roles-de-usuario)
3. [Dashboard - Panel Principal](#3-dashboard---panel-principal)
4. [Votantes](#4-votantes)
5. [Importar desde Excel](#5-importar-desde-excel)
6. [Búsqueda Rápida](#6-búsqueda-rápida)
7. [Control de Votación (Veedores)](#7-control-de-votación-veedores)
8. [Faltantes](#8-faltantes)
9. [Reportes](#9-reportes)
10. [Auditoría](#10-auditoría)
11. [Configuración](#11-configuración)
12. [Cerrar Sesión](#12-cerrar-sesión)

---

## 1. ACCESO AL SISTEMA

Abra su navegador e ingrese la dirección del sistema.

En la pantalla de inicio complete:

| Campo | Descripción |
|-------|-------------|
| **Usuario** | Nombre de usuario asignado |
| **Contraseña** | Contraseña personal |

Haga clic en **"Ingresar"**.

> El sistema lo redirigirá automáticamente según su rol:
> - **Veedor** → pantalla de Control de Votación
> - **Otros roles** → Dashboard principal

---

## 2. ROLES DE USUARIO

El sistema tiene 4 niveles de acceso:

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Administrador** | Acceso total al sistema | Todas las pantallas |
| **Jefe de Zona** | Gestión de su zona electoral | Dashboard, Votantes, Reportes, Faltantes |
| **Coordinador** | Gestión de sus votantes asignados | Dashboard, Votantes, Búsqueda, Faltantes |
| **Veedor** | Solo registra votos en el día de elección | Control de Votación únicamente |

---

## 3. DASHBOARD - PANEL PRINCIPAL

Es la pantalla principal con el resumen en tiempo real de la elección.

### Tarjetas de Estadísticas

| Tarjeta | Descripción |
|---------|-------------|
| **Total Votantes** | Cantidad total de personas en el padrón |
| **Ya Votaron** | Cuántos han ejercido su voto (verde) |
| **Pendientes** | Cuántos aún no han votado (naranja) |
| **Porcentaje** | Porcentaje de participación actual |

### Barra de Progreso
Muestra visualmente el avance de la votación de 0% a 100%.

### Tabla por Zona *(solo Administrador y Jefe de Zona)*
Muestra el avance desglosado por zona:
- **Zona** | **Total** | **Votaron** | **Pendientes** | **%**
- El botón **"Ver Faltantes"** filtra directamente los votantes pendientes de esa zona.

---

## 4. VOTANTES

Gestión completa del padrón electoral.

### Buscar y Filtrar Votantes

Haga clic en el panel **"Filtros"** para expandirlo:

| Filtro | Descripción |
|--------|-------------|
| **Buscar** | Escriba nombre, apellido o cédula |
| **Departamento** | Filtra por departamento geográfico |
| **Distrito** | Se activa al seleccionar Departamento |
| **Zona** | Se activa al seleccionar Departamento |
| **Estado Votación** | Filtre entre "Ya votó" o "Pendiente" |

- **"Limpiar filtros"** — elimina todos los filtros aplicados
- La tabla muestra: N° Orden, Cédula, Nombres, Apellidos, Departamento, Distrito, Seccional, Local, Mesa, Estado

### Agregar Nuevo Votante

1. Haga clic en **"Nuevo Votante"**
2. Complete el formulario:

**Datos Personales:**
- Nombres *(obligatorio)*
- Apellidos *(obligatorio)*
- Cédula de Identidad *(obligatorio)*
- Teléfono *(opcional)*

**Datos Electorales:**
- Departamento / Distrito / Zona *(obligatorios, jerárquicos)*
- Seccional *(obligatorio)*
- Local de Votación *(obligatorio)*
- Mesa *(obligatorio, número)*
- N° Orden *(obligatorio, número)*

**Asignación:**
- Coordinador *(obligatorio)*
- Jefe Zonal *(opcional)*
- Movimiento *(opcional)*
- Localidad / Dirección *(opcional)*

3. Haga clic en **"Guardar"**

### Editar Votante

En la tabla, haga clic en el ícono de **lápiz** (editar) en la fila del votante. Se abrirá el mismo formulario con los datos precargados.

---

## 5. IMPORTAR DESDE EXCEL

Permite cargar grandes cantidades de votantes desde un archivo Excel.

### Paso 1 — Preparar el archivo Excel

El archivo debe tener estas columnas exactas:

| Columna | Tipo | Obligatorio |
|---------|------|-------------|
| cedula | Texto/Número | Sí |
| nombres | Texto | Sí |
| apellidos | Texto | Sí |
| departamento | Texto | Sí |
| distrito | Texto | Sí |
| seccional | Texto | Sí |
| local_votacion_id | Número | Sí |
| mesa | Número | Sí |
| numero_orden | Número | Sí |
| zona_id | Número | Sí |
| coordinador_id | Número | Sí |
| jefe_zona_id | Número | No |
| movimiento_id | Número | No |
| telefono | Texto | No |
| localidad | Texto | No |

### Paso 2 — Subir el archivo

1. Vaya a **"Importar Excel"** en el menú
2. Arrastre el archivo `.xlsx` o `.xls` al área indicada, o haga clic para seleccionarlo
3. El sistema mostrará una vista previa con:
   - **Registros válidos** (verde)
   - **Registros con errores** (rojo) con detalle del error por fila

### Paso 3 — Confirmar importación

- Revise los errores si los hay
- Haga clic en **"Confirmar Importación"** para cargar los registros válidos
- Al finalizar verá: cuántos se importaron y cuántos se saltaron (duplicados)

---

## 6. BÚSQUEDA RÁPIDA

Permite encontrar un votante específico rápidamente.

1. Vaya a **"Búsqueda"** en el menú
2. Escriba el **nombre**, **cédula** o **número de orden** del votante
3. Haga clic en **"Buscar"**

El resultado muestra:
- Nombre completo
- Cédula | N° Orden | Mesa
- Departamento | Distrito | Seccional | Local | Coordinador
- Estado: **"Ya Votó"** (verde) o **"Pendiente"** (naranja)

---

## 7. CONTROL DE VOTACIÓN (VEEDORES)

Esta pantalla es **exclusiva para Veedores** y se usa el día de la elección para registrar votos.

### Cómo registrar un voto

1. Ingrese el **N° Orden** o **Cédula** del votante (puede escanear con lector de código)
2. Haga clic en **"Buscar"**
3. El sistema mostrará los datos del votante y su estado actual
4. Si el votante **aún no ha votado**:
   - Verifique que sea la persona correcta
   - Haga clic en **"Confirmar Voto"**
   - El sistema registrará el voto y mostrará **"¡Voto registrado exitosamente!"**
5. Haga clic en **"Nueva Búsqueda"** para el siguiente votante

### Situaciones posibles

| Situación | Lo que muestra el sistema |
|-----------|--------------------------|
| Votante encontrado, no votó | Datos del votante + botón "Confirmar Voto" |
| Votante ya votó | Aviso en naranja "Este votante ya ejerció su voto" |
| No se encuentra | Mensaje de error — verifique el número ingresado |

> **Importante:** Una vez confirmado el voto, no puede revertirse.

---

## 8. FALTANTES

Lista de votantes que **aún no han ejercido su voto**.

1. Vaya a **"Faltantes"** en el menú
2. Use el filtro **"Zona"** para ver una zona específica o déjelo en "Todas"
3. La tabla muestra: N° Orden | Cédula | Nombre | Zona | Teléfono

> El teléfono se muestra para facilitar el contacto y movilización de votantes pendientes.

---

## 9. REPORTES

Central de información y estadísticas. Tiene 4 pestañas:

---

### PESTAÑA 1: OPERATIVO DÍA D

**Avance por Coordinador**
- Muestra el rendimiento de cada coordinador (de menor a mayor avance)
- Columnas: Coordinador | Zona | Total | Votaron | Pendientes | Avance %
- La barra de progreso es **verde** si supera 75%, **naranja** si está por debajo

**Avance por Local** *(Administrador y Jefe de Zona)*
- Muestra locales de votación ordenados por pendientes
- Útil para identificar locales que necesitan más gestión

**Velocidad de Marcación por Hora** *(solo Administrador)*
- Cuántos votos se registraron cada hora del día
- Muestra el acumulado y porcentaje por hora

---

### PESTAÑA 2: PADRÓN (Descargas Excel)

| Descarga | Acceso | Archivo |
|----------|--------|---------|
| **Padrón Completo** | Solo Administrador | padron-completo.xlsx |
| **Padrón por Zona** | Admin y Jefe de Zona | padron-zona-{id}.xlsx |
| **Padrón por Coordinador** | Admin y Coordinador | padron-coord-{id}.xlsx |
| **Lista de Faltantes** | Todos los roles | faltantes.xlsx |

Para descargar: seleccione la zona o coordinador si aplica y haga clic en **"Descargar Excel"**.

---

### PESTAÑA 3: AUDITORÍA *(solo Administrador)*

**Registro de Marcaciones de Voto**
- Todos los votos registrados con: N° Orden | Votante | Veedor | Mesa | Fecha y Hora

**Detección de Datos Similares**
- **Teléfonos Duplicados:** detecta el mismo teléfono en varios votantes
- **Nombres Similares (SOUNDEX):** detecta nombres fonéticamente parecidos que podrían ser duplicados

---

### PESTAÑA 4: GESTIÓN *(solo Administrador)*

**Estructura Territorial Completa**
- Vista jerárquica: Zonas → Coordinadores
- Muestra Total | Ya Votaron | Pendientes por coordinador

**Votantes Cargados por Usuario**
- Muestra qué usuario cargó cuántos votantes y cuándo

---

## 10. AUDITORÍA *(solo Administrador)*

Registro completo de todas las acciones realizadas en el sistema.

**Filtros disponibles:**
- **Acción:** Todas | Crear | Editar | Marcar voto
- **Tabla:** Todas | Votantes | Marcaciones

**La tabla muestra:**
- Fecha y Hora
- Usuario que realizó la acción
- Tipo de acción (color): Verde = Crear | Azul = Editar | Violeta = Marcar voto
- Tabla afectada
- ID del registro
- IP de origen

---

## 11. CONFIGURACIÓN *(solo Administrador)*

Gestión de los datos maestros del sistema. Tiene 4 pestañas:

---

### USUARIOS

**Agregar usuario:**
1. Haga clic en **"Nuevo Usuario"**
2. Complete: Nombre | Usuario | Contraseña | Confirmar Contraseña | Rol | Zona
3. Active o desactive el usuario con el interruptor **"Usuario activo"**
4. Haga clic en **"Guardar"**

**Editar usuario:**
- Haga clic en el ícono de lápiz
- Para cambiar contraseña: ingrese la nueva; para mantenerla: deje el campo vacío

**Roles disponibles:** Administrador | Jefe de Zona | Coordinador | Veedor

---

### ZONAS

Agregue zonas electorales:
- **Nombre de Zona** *(obligatorio)*
- **Jefe de Zona** *(opcional, seleccione de la lista)*
- Haga clic en **"Agregar"**

---

### JEFES DE ZONA

Registre los jefes de zona:
- **Nombre Completo** *(obligatorio)*
- **Cédula** *(obligatorio)*
- **Teléfono** *(opcional)*
- Haga clic en **"Agregar"**

---

### MOVIMIENTOS

Registre movimientos políticos y candidatos:
- **Nombre del Movimiento** *(obligatorio)*
- **Nombre del Candidato** *(obligatorio)*
- **Lista** *(opcional, ej: A1)*
- **Partido** *(opcional)*
- Haga clic en **"Agregar"**

---

## 12. CERRAR SESIÓN

En el menú lateral izquierdo, al final, haga clic en **"Cerrar Sesión"**.

> Se recomienda siempre cerrar sesión al terminar de usar el sistema, especialmente en computadoras compartidas.

---

## SOPORTE TÉCNICO

Ante cualquier inconveniente técnico, contacte al administrador del sistema.

---

*Sistema Electoral — Manual de Usuario v1.0 — Abril 2026*
