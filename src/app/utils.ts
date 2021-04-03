import * as bs58check from 'bs58check'

export const parseDate = (value: string): Date => {
  const year = value.substring(0, 4).padStart(2, '0')
  const month = value.substring(5, 7).padStart(2, '0')
  const day = value.substring(8, 10).padStart(2, '0')
  const hour = value.substring(11, 13).padStart(2, '0')
  const minute = value.substring(14, 16).padStart(2, '0')
  const second = value.substring(17, 19).padStart(2, '0')

  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
  )

  if (!isNaN(date.getTime())) {
    return date
  }
  throw new Error('CANNOT PARSE DATE')
}

const pendingRequests = new Map()
export const wrapApiRequest = async (
  name: string,
  fn: () => Promise<void>
): Promise<void> => {
  if (pendingRequests.has(name)) {
    console.warn(`Request "${name}" is already pending, skipping`)
    return
  }

  pendingRequests.set(name, true)

  let res
  try {
    res = await fn()
  } catch (e) {
    console.error('API ERROR', e)
  }

  pendingRequests.delete(name)

  return res
}

const tezosPrefixes: {
  tz1: Buffer
  tz2: Buffer
  tz3: Buffer
  kt: Buffer
  edpk: Buffer
  edsk: Buffer
  edsig: Buffer
  branch: Buffer
} = {
  tz1: Buffer.from(new Uint8Array([6, 161, 159])),
  tz2: Buffer.from(new Uint8Array([6, 161, 161])),
  tz3: Buffer.from(new Uint8Array([6, 161, 164])),
  kt: Buffer.from(new Uint8Array([2, 90, 121])),
  edpk: Buffer.from(new Uint8Array([13, 15, 37, 217])),
  edsk: Buffer.from(new Uint8Array([43, 246, 78, 7])),
  edsig: Buffer.from(new Uint8Array([9, 245, 205, 134, 18])),
  branch: Buffer.from(new Uint8Array([1, 52])),
}

export const parseAddress = (bytes: string | Buffer): string => {
  let rawHexAddress: string =
    typeof bytes === 'string' ? bytes : bytes.toString('hex')

  if (rawHexAddress.startsWith('0x')) {
    rawHexAddress = rawHexAddress.slice(2)
  }
  const { result, rest }: { result: string; rest: string } = splitAndReturnRest(
    rawHexAddress,
    2
  )
  const contractIdTag: string = result
  if (contractIdTag === '00') {
    // tz address
    return parseTzAddress(rest)
  } else if (contractIdTag === '01') {
    // kt address
    return prefixAndBase58CheckEncode(rest.slice(0, -2), tezosPrefixes.kt)
  } else {
    throw new Error(`address format not supported (${rawHexAddress})`)
  }
}

const parseTzAddress = (rawHexAddress: string): string => {
  // tz1 address
  const { result, rest }: { result: string; rest: string } = splitAndReturnRest(
    rawHexAddress,
    2
  )
  const publicKeyHashTag: string = result
  switch (publicKeyHashTag) {
    case '00':
      return prefixAndBase58CheckEncode(rest, tezosPrefixes.tz1)
    case '01':
      return prefixAndBase58CheckEncode(rest, tezosPrefixes.tz2)
    case '02':
      return prefixAndBase58CheckEncode(rest, tezosPrefixes.tz3)
    default:
      throw new Error(`address format not supported (${rawHexAddress})`)
  }
}

const prefixAndBase58CheckEncode = (
  hexStringPayload: string,
  tezosPrefix: Uint8Array
): string => {
  const prefixHex: string = Buffer.from(tezosPrefix).toString('hex')

  return bs58check.encode(Buffer.from(prefixHex + hexStringPayload, 'hex'))
}

const splitAndReturnRest = (
  payload: string,
  length: number
): { result: string; rest: string } => {
  const result: string = payload.substr(0, length)
  const rest: string = payload.substr(length, payload.length - length)

  return { result, rest }
}

/**
 * Better Call Dev introduced a breaking change, so we have to handle 2 different cases for all "parameters"
 */
export const handleBCDBreakingChange = (parameters: any): any => {
  return Array.isArray(parameters) ? parameters[0] : parameters
}
