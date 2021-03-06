import { of } from 'rxjs';
import {
  asyncValidator,
  emptyArray,
  emptyObject,
  factoryBitConfig,
  factoryLocales,
  getQuerySchema,
  getSelectorFormUrl
} from 'ngx-bit/operates';
import { switchMap } from 'rxjs/operators';
import { environment } from '@env';
import { validate } from './validate';

describe('operates', () => {
  it('Test asyncValidator', (done) => {
    asyncValidator(of({
      error: 0,
      data: true
    })).pipe(
      switchMap(result => {
        expect(result).toEqual({ error: true, duplicated: true });
        return asyncValidator(of({
          error: 0,
          data: false
        }));
      }),
      switchMap(result => {
        expect(result).toBeNull();
        return asyncValidator(of({
          error: 1
        }));
      })
    ).subscribe(result => {
      expect(result).toEqual({ error: true, duplicated: true });
      done();
    });
  });

  it('Test emptyArray', () => {
    expect(emptyArray([1, 2, 3])).toBeFalsy();
    expect(emptyArray([])).toBeTruthy();
  });

  it('Test emptyObject', () => {
    expect(emptyObject({ name: 'kain' })).toBeFalsy();
    expect(emptyObject([])).toBeFalsy();
    expect(emptyObject({})).toBeTruthy();
  });

  it('Test factoryBitConfig', () => {
    const config = factoryBitConfig(environment.bit);
    expect(config.url).toBe(environment.bit.url);
    expect(config.api).toBe(environment.bit.api);
    expect(config.locale).toBe(environment.bit.locale);
    expect(config.page).toBe(environment.bit.page);
    expect(config.col).toBe(environment.bit.col);
    expect(config.i18n).toBe(environment.bit.i18n);
  });

  it('Test factoryLocales', (done) => {
    import('../simulation/common.language').then(result => {
      const lang = factoryLocales(result.default, environment.bit.locale.mapping);
      expect(lang.zh_cn).not.toBeNull();
      expect(lang.zh_cn.dashboard).toEqual('仪表盘');
      expect(lang.en_us).not.toBeNull();
      expect(lang.en_us.dashboard).toEqual('Dashboard');
      done();
    });
  });

  it('Test getQuerySchema', () => {
    let schema = getQuerySchema([
      { field: 'username', op: '=', value: '' }
    ]);
    expect(schema).toEqual([]);
    schema = getQuerySchema([
      { field: 'username', op: '=', value: '', must: true }
    ]);
    expect(schema).toEqual([['username', '=', '']]);
    schema = getQuerySchema([
      { field: 'username', op: '=', value: 'kain' }
    ]);
    expect(schema).toEqual([['username', '=', 'kain']]);
    schema = getQuerySchema([
      { field: 'username', op: '=', value: null },
      { field: 'type', op: '=', value: 0 },
      { field: 'ids', op: 'in', value: [] },
      { field: 'error', op: '=', value: {} }
    ]);
    expect(schema).toEqual([]);
  });

  it('Test getSelectorFormUrl', () => {
    let key = getSelectorFormUrl('/%7Bacl-index%7D', ['%7B', '%7D']);
    expect(key).toEqual('acl-index');
    key = getSelectorFormUrl('/%7Bacl-edit%7D/1', ['%7B', '%7D']);
    expect(key).toEqual('acl-edit');
    key = getSelectorFormUrl('/%7Bacl-edit%7D/1/2', ['%7B', '%7D']);
    expect(key).toEqual('acl-edit');
  });

  it('Test validate', () => {
    let valid = validate({
      enum: [1, 2, 3, 4]
    }, 1);
    expect(valid.error).toBeFalsy();
    valid = validate({
      enum: [1, 2, 3, 4]
    }, 5);
    expect(valid.error).toBeTruthy();
  });

});
