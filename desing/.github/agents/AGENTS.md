# TutoríasU – Frontend

## Contexto
Plataforma web de tutorías con 3 roles (estudiante, profesor, administrador).
Requisitos: `docs/historias_de_usuario.md`. Fuente de verdad visual: `design/`.

## Stack
React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query,
React Hook Form + Zod, Recharts.

## Reglas
1. El diseño manda. Antes de una pantalla lee `design/DESIGN.md` y los archivos de
   `design/screens/<id>/`. No inventes colores, espaciados ni tipografías: usa solo
   los tokens definidos en `tailwind.config`.
2. Mobile-first y responsive (390 / 768 / 1440 px). Sin scroll horizontal.
3. WCAG 2.1 AA: labels visibles, foco visible, contraste 4.5:1, áreas táctiles ≥ 44px,
   HTML semántico. Los estados nunca se comunican solo con color.
4. Cada pantalla cubre estados: carga, vacío, error y éxito.
5. Textos de interfaz en español (Colombia).
6. Cumple los criterios de aceptación de cada HU. Cita el ID (HU-xx) en el archivo y en el commit.
7. Estructura: `src/features/<rol>/<pantalla>`; compartidos en `src/components/ui`.
8. Sin backend, usa mocks (MSW) con la misma forma que tendrá la API.
9. Una tarea termina cuando pasan `npm run lint` y `npm run build`.
10. No cambies nada fuera del alcance pedido ni instales dependencias sin avisar.