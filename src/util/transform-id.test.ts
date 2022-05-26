import { describe, it } from 'mocha'
import { expect } from 'chai'
import { withId, withoutId } from './transform-id'

describe('transform-id', () => {
  it('should add Id to the end of the name', () => {
    expect(withId('post')).to.equal('postId')
  })

  it('should strip Id from the name', () => {
    expect(withoutId('poidId')).to.equal('poid')
  })
})
