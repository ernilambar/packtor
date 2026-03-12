const utils = require('.././src/utils')

test('Get includes files from the list', () => {
  const sourceFiles = ['a.txt', 'b.txt', '!c.txt']

  const includeFiles = utils.packtorGetIncludes(sourceFiles)

  const expectedFiles = ['a.txt', 'b.txt']

  expect(includeFiles).toStrictEqual(expectedFiles)
})
