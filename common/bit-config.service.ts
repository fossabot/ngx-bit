import { Injectable } from '@angular/core';
import { factoryLocales } from '../operates/factory-locales';
import { BitConfig } from '../types/bit-config';
import { BitI18nOption } from '../types/bit-i18n-option';

@Injectable({
  providedIn: 'root'
})
export class BitConfigService implements BitConfig {
  url: {
    api: string;
    static: string;
    icon?: string
  };
  api: {
    namespace: string;
    upload: string;
    withCredentials: boolean
  };
  col: {
    [p: string]: any
  };
  i18n: {
    default: string;
    contain: string[];
    switch: BitI18nOption[]
  };
  locale: {
    default: string;
    mapping: Map<number, string>
    bind: Map<string, any>
  };
  page: number;
  /**
   * Common language packer
   */
  private lang: any = {};

  /**
   * Setup common language pack
   */
  setupLocales(packer: Promise<any>) {
    packer.then(result => {
      this.lang = factoryLocales(result.default, this.locale.mapping);
    });
  }

  /**
   * Get a language
   */
  getLang(locale: string) {
    return this.lang[locale];
  }
}