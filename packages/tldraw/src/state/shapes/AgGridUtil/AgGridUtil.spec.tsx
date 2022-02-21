import { AgGrid } from '..'

describe('AGGrid shape', () => {
  it('Creates a shape', () => {
    expect(AgGrid.create({ id: 'aggrid' })).toMatchSnapshot('aggrid')
  })
})
