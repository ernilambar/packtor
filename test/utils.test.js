const utils = require('.././src/utils')

test('Get includes files from the list', () => {
  const source_files = ['a.txt', 'b.txt', '!c.txt']

  const include_files = utils.packtorGetIncludes(source_files)

  const expected_files = ['a.txt', 'b.txt']

  expect(include_files).toStrictEqual(expected_files)
})
