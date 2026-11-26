import { UpdateError } from '#/modules/updates/domain/errors';
import { VersionValueObject } from '#/modules/updates/domain/valueObjects';

function version(text: string): VersionValueObject {
  return VersionValueObject.parse({
    text,
  });
}

describe('#VersionValueObject', () => {
  describe('.parse', () => {
    suite('when the text is major.minor.patch', () => {
      it('reads the three numbers', () => {
        expect(version('1.20.3').toString()).toEqual('1.20.3');
      });
    });

    suite('when the text is not a version', () => {
      it('throws an invalid version error', () => {
        for (const text of ['', '1.2', '1.2.3.4', 'v1.2.3', '1.2.x']) {
          expect(() => {
            return version(text);
          }).toThrow(UpdateError);
        }
      });
    });
  });

  describe('.isNewerThan', () => {
    suite('when the numbers differ', () => {
      it('compares them as numbers, not text', () => {
        expect(version('0.10.0').isNewerThan(version('0.9.9'))).toBe(true);
        expect(version('1.0.0').isNewerThan(version('0.99.99'))).toBe(true);
      });
    });

    suite('when the versions are equal', () => {
      it('is not newer', () => {
        expect(version('0.2.0').isNewerThan(version('0.2.0'))).toBe(false);
      });
    });
  });
});
