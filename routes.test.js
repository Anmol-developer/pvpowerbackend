({sendQueryMail} = require('./routes'))

test('should return Sent mail', () => {
    expect(sendQueryMail('alfez','alfaizmansuri47@gmail.com','Test','This is testing')).toBe('Sent mail')
})