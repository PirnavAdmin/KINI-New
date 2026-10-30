import { expect, it } from 'vitest';
import { personNameError } from '../../src/shared/utils/personName';
it.each(['Srinivas','John Paul','Anne-Marie',"O'Connor",'Jos\u00e9','\u0c36\u0c4d\u0c30\u0c40','\u738b\u5c0f\u660e'])('accepts name %s', name => {
  expect(personNameError(name, 'First name')).toBe('');
});
it.each(['123','Srinivas123','John99','12Mary','Mary\u0661','\uff11\uff12','  ','---'])('rejects invalid name %s', name => {
  expect(personNameError(name, 'Last name')).not.toBe('');
});
