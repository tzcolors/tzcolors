import { AmountConverterPipe } from './amount.pipe'

describe('AmountConverterPipe', () => {
  it('create an instance', () => {
    const pipe = new AmountConverterPipe()
    expect(pipe).toBeTruthy()
  })
})
