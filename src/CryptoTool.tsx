import { useState } from 'react'
import { encryptData, deCryptData } from './crypto'

const STORAGE_KEY = 'llave'

type Modo = '' | 'cifrado' | 'descifrado'

const encodeKey = (value: string): string =>
  btoa(String.fromCharCode(...new TextEncoder().encode(value)))

const decodeKey = (value: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(value), (char) => char.charCodeAt(0)))

export default function CryptoTool() {
  const [llave, setLlave] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? decodeKey(stored) : ''
    } catch {
      // Valor corrupto en localStorage: se ignora.
      return ''
    }
  })
  const [modo, setModo] = useState<Modo>('')
  const [verLlave, setVerLlave] = useState(false)
  const [data, setData] = useState('')
  const [resultado, setResultado] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [copiado, setCopiado] = useState(false)

  const copiarResultado = async () => {
    if (!resultado) return

    try {
      await navigator.clipboard.writeText(resultado)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      setMensaje('No se pudo copiar el resultado.')
    }
  }

  const guardar = () => {
    if (!llave.trim()) {
      setMensaje('Escribe una llave antes de guardar.')
      return
    }

    localStorage.setItem(STORAGE_KEY, encodeKey(llave))
    setMensaje('Llave guardada en localStorage (base64).')
  }

  const limpiar = () => {
    localStorage.removeItem(STORAGE_KEY)
    setLlave('')
    setMensaje('Llave eliminada.')
  }

  const procesar = () => {
    setCopiado(false)

    if (!llave.trim()) {
      setMensaje('Debe existir una llave para procesar.')
      setResultado('')
      return
    }

    if (!modo) {
      setMensaje('Seleccione "cifrado" o "descifrado".')
      setResultado('')
      return
    }

    if (!data.trim()) {
      setMensaje('Escriba algo en el área de datos.')
      setResultado('')
      return
    }

    // Sincroniza la llave usada por src/crypto.ts
    localStorage.setItem(STORAGE_KEY, encodeKey(llave))
    setMensaje('')

    if (modo === 'cifrado') {
      let payload: object

      try {
        const parsed: unknown = JSON.parse(data)
        payload = typeof parsed === 'object' && parsed !== null ? parsed : { data }
      } catch {
        payload = { data }
      }

      setResultado(encryptData(payload))
      return
    }

    const descifrado = deCryptData(data)

    if (descifrado === null) {
      setMensaje('No se pudo descifrar. Revise la llave y que los datos sean un cifrado válido.')
      setResultado('')
      return
    }

    setResultado(JSON.stringify(descifrado, null, 2))
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Herramienta de cifrado</h1>

      <section className="flex flex-col gap-2">
        <label htmlFor="llave" className="font-medium">
          Llave
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="llave"
              type={verLlave ? 'text' : 'password'}
              value={llave}
              onChange={(event) => setLlave(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none"
              placeholder="Ingrese la llave"
            />
            <button
              type="button"
              onClick={() => setVerLlave((value) => !value)}
              aria-label={verLlave ? 'Ocultar llave' : 'Ver llave'}
              title={verLlave ? 'Ocultar llave' : 'Ver llave'}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {verLlave ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={guardar}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
          >
            Limpiar
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="modo" className="font-medium">
          Operación
        </label>
        <select
          id="modo"
          value={modo}
          onChange={(event) => setModo(event.target.value as Modo)}
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Seleccione...</option>
          <option value="cifrado">cifrado</option>
          <option value="descifrado">descifrado</option>
        </select>
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="data" className="font-medium">
          Datos
        </label>
        <textarea
          id="data"
          value={data}
          onChange={(event) => setData(event.target.value)}
          rows={6}
          className="w-full resize-y rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder='JSON para cifrar, o el texto cifrado para descifrar ({"foo": "bar"})'
        />
      </section>

      <button
        type="button"
        onClick={procesar}
        className="self-start rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700"
      >
        Procesar
      </button>

      {mensaje && <p className="text-sm text-amber-700">{mensaje}</p>}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Resultado</span>
          <button
            type="button"
            onClick={copiarResultado}
            disabled={!resultado}
            title="Copiar resultado"
            className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copiado ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-600">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Copiado
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>
        <pre className="min-h-24 overflow-auto whitespace-pre-wrap break-all rounded border border-gray-300 bg-gray-50 px-3 py-2">
          {resultado}
        </pre>
      </section>
    </div>
  )
}
