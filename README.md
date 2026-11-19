# Claridad — Herramienta de cifrado

Aplicación web para cifrar y descifrar datos (JSON o texto) mediante **AES**, construida con React + TypeScript + Vite y estilizada con **Tailwind CSS v4**.

## Características

- **Cifrado / descifrado AES** con [CryptoJS](https://www.npmjs.com/package/crypto-js).
- **Llave de cifrado** con las siguientes prioridades:
  1. Valor guardado en `localStorage` (clave `llave`, almacenada en base64).
  2. Constante `KEY_CRYPTO` en `src/crypto.ts` (vacío por defecto → usa el valor por defecto del backend).
- Campo de llave oculta/mostrable (ojo), con botones **Guardar** y **Limpiar**.
- Selección de operación: `cifrado` o `descifrado`.
- Entrada flexible: si el texto es JSON válido se cifra tal cual; si no, se envuelve como `{ "data": "<texto>" }`.
- Resultado formateado en el descifrado y botón **Copiar** al portapapeles.
- Mensajes de validación en español (llave requerida, operación requerida, datos inválidos, fallo de descifrado).

## Estructura

```
src/
├── App.tsx          # Punto de entrada de la UI (renderiza CryptoTool)
├── CryptoTool.tsx   # Componente con el formulario (llave, operación, datos, resultado)
├── crypto.ts        # Funciones encrypt / deCrypt / encryptData / deCryptData (AES)
├── index.css        # Importación de Tailwind CSS v4
└── main.tsx         # Bootstrap de React
```

## Requisitos

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) (se incluye `pnpm-lock.yaml`; también funciona con `npm`)

## Instalación y ejecución

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo (con HMR)
pnpm dev

# Verificación de tipos + build de producción
pnpm build

# Vista previa del build
pnpm preview

# Lint (Oxlint)
pnpm lint
```

## Uso

1. Escribe una **llave** y presiona **Guardar** (queda en `localStorage` en base64).
2. Selecciona la **operación**: `cifrado` o `descifrado`.
3. Pega los **datos**: JSON para cifrar, o el texto cifrado para descifrar.
4. Presiona **Procesar**.
5. Copia el **resultado** con el botón correspondiente.

> **Nota de seguridad:** la llave se guarda en `localStorage` en base64, lo cual es decodificación, no cifrado. Esta herramienta está pensada para uso local/desarrollo; no alojes llaves sensibles en un navegador compartido.

## Backend / transacciones

`src/crypto.ts` incluye utilidades pensadas para envolver transacciones hacia el backend en un sobre cifrado (`transactionData`). La llave del servidor (`CRYPTO_KEY`) **nunca** debe exponerse en el bundle del navegador (no usar prefijos como `NEXT_PUBLIC_`).

## Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) (plugin `@tailwindcss/vite`)
- [CryptoJS](https://www.npmjs.com/package/crypto-js)
- [Oxlint](https://oxc.rs/) como linter
