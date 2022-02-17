import { Plotly } from '..'

describe('Plotly shape', () => {
  it('Creates a shape', () => {
    expect(Plotly.create({ id: 'plotly' })).toMatchSnapshot('plotly')
  })
})
