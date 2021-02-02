import { Pipe, PipeTransform } from '@angular/core'
import BigNumber from 'bignumber.js'

type AmountConverterValue = BigNumber | string | number | null | undefined

interface AmountConverterArgs {
  decimals: number
  symbol: string
  maxDigits?: number
}

interface AmountConverterNumberFormat {
  decimalSeparator: string
  groupSeparator: string
  groupSize: number
}

const FORMAT_UNITS: Record<string, string> = {
  [1e3]: 'K',
  [1e6]: 'M',
}
const SUPPORTED_FORMAT_DECIMAL_SIZES: string[] = Object.keys(FORMAT_UNITS)

@Pipe({
  name: 'amountConverter',
})
export class AmountConverterPipe implements PipeTransform {
  public static readonly defaultMaxDigits: number = 10
  public static readonly numberFormat: AmountConverterNumberFormat = {
    decimalSeparator: '.',
    groupSeparator: `'`,
    groupSize: 3,
  }

  constructor() {}

  public async transform(
    value: AmountConverterValue,
    args: AmountConverterArgs
  ): Promise<string> {
    if (!args.decimals) {
      throw new Error('Invalid decimals')
    }

    if (!args.symbol) {
      throw new Error('Invalid symbol')
    }

    if (
      !(
        typeof value === 'string' ||
        typeof value === 'number' ||
        BigNumber.isBigNumber(value)
      )
    ) {
      throw new Error('Invalid amount')
    }

    if (args.maxDigits !== undefined && typeof args.maxDigits !== 'number') {
      throw new Error('Invalid maxDigits')
    }

    const amount = this.transformValueOnly(value, args.decimals, args.maxDigits)

    return `${amount} ${args.symbol}`
  }

  public transformValueOnly(
    value: string | number | BigNumber,
    decimals: number,
    maxDigits: number | undefined
  ): string | undefined {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const BN = BigNumber.clone({ FORMAT: AmountConverterPipe.numberFormat })
    const valueBN = new BN(value)

    if (valueBN.isNaN() || (maxDigits && isNaN(maxDigits))) {
      throw new Error('Invalid amount')
    }

    const amount = valueBN
      .shiftedBy(-1 * decimals)
      .decimalPlaces(decimals, BigNumber.ROUND_FLOOR)

    return this.formatBigNumber(amount, maxDigits)
  }

  public formatBigNumber(value: BigNumber, maxDigits?: number): string {
    if (maxDigits === undefined || value.toFixed().length <= maxDigits) {
      return value.toFormat()
    }

    const integerValueLength = value.integerValue().toString().length
    if (integerValueLength >= maxDigits) {
      // We can omit floating point
      return this.abbreviateNumber(value, maxDigits)
    }

    // Need regex to remove all unneccesary trailing zeros
    return value.toFormat(maxDigits - integerValueLength).replace(/\.?0+$/, '')
  }

  public abbreviateNumber(value: BigNumber, maxDigits: number): string {
    if (maxDigits === 0) {
      return value.toFormat()
    }

    let abbreviated: BigNumber = value
    let suffix: string = ''

    let nextDecimalsIndex: number = 0
    while (
      abbreviated.toFixed().length > Math.max(maxDigits, 3) &&
      nextDecimalsIndex < SUPPORTED_FORMAT_DECIMAL_SIZES.length
    ) {
      const decimals: BigNumber = new BigNumber(
        SUPPORTED_FORMAT_DECIMAL_SIZES[nextDecimalsIndex]
      )
      abbreviated = value.dividedToIntegerBy(decimals)
      suffix = FORMAT_UNITS[decimals.toString()]

      nextDecimalsIndex++
    }

    return `${abbreviated.toFormat()}${suffix}`
  }
}
