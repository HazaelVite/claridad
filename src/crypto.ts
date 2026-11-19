import CryptoJS from 'crypto-js'

/*
 * Cifrado AES de las transacciones con el backend de la Facultad.
 *
 * Todo viaja dentro de `transactionData`: el backend recibe un sobre cifrado
 * y responde con otro sobre cifrado. La llave vive en `CRYPTO_KEY` (servidor
 * solamente): NUNCA debe llevar el prefijo `NEXT_PUBLIC_`, o quedaría expuesta
 * en el bundle del navegador.
 */

// ** Clave de cifrado. Si no está definida, se usa el valor por defecto del backend.
const KEY_CRYPTO = ''

// ** Clave guardada en localStorage (base64). Tiene prioridad sobre KEY_CRYPTO.
const STORAGE_KEY = 'llave'

const getKey = (): string => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const bytes = Uint8Array.from(atob(stored), (char) => char.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    }
  } catch {
    // localStorage no disponible o valor corrupto: se usa KEY_CRYPTO.
  }

  return KEY_CRYPTO
}

export const encrypt = (text: string): string => CryptoJS.AES.encrypt(text, getKey()).toString()

export const deCrypt = (text: string): string | null => {
  try {
    const deCryptedText = CryptoJS.AES.decrypt(text, getKey())

    const deCryptedTextTransparent = deCryptedText.toString(CryptoJS.enc.Utf8)

    if (!deCryptedTextTransparent) {
      throw new Error('Decryption failed: empty string returned.')
    }

    return deCryptedTextTransparent
  } catch {
    return null
  }
}

export const encryptData = (data: object): string => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data type. Expected object.')
  }

  return encrypt(JSON.stringify(data))
}

export const deCryptData = <T = unknown>(encryptedData: string): T | null => {
  const decrypted = deCrypt(encryptedData)

  if (!decrypted) return null

  try {
    return JSON.parse(decrypted) as T
  } catch {
    return null
  }
}
