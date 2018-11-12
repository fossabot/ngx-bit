import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {FormGroup, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {NzMessageService, NzNotificationService} from 'ng-zorro-antd';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {I18nControlsOptions} from './interface';
import {i18nControlsValue, i18nControlsAsyncValidate, i18nControlsValidate, factoryLocales} from './operates';
import {ConfigService} from './config.service';
import {EventsService} from './events.service';

@Injectable()
export class BitService {
  static: string;
  uploads: string;
  locale: string;

  form: FormGroup;
  l: any = {};
  i18ns: any[] = [];

  lists_loading = true;
  page_limit = 0;
  lists_totals = 0;
  lists_page_index = 0;
  lists_all_checked = false;
  lists_indeterminate = false;
  lists_disabled_action = true;
  lists_checked_number = 0;

  private language: any = {};
  private common_language: any = {};
  private menu: Map<number, any> = new Map();
  private actives = [];
  private breadcrumb = [];
  private path = 0;

  constructor(private storage: LocalStorage,
              private config: ConfigService,
              private notification: NzNotificationService,
              private message: NzMessageService,
              private events: EventsService,
              private location: Location) {
    this.static = config.static;
    this.uploads = config.origin + '/' + config.uploads;
    this.i18ns = config.i18n;
    this.page_limit = config.page_limit;
    this.locale = localStorage.getItem('locale') ? localStorage.getItem('locale') : 'zh_cn';
    events.on('locale').subscribe(locale => {
      let tips;
      switch (locale) {
        case 'zh_cn':
          tips = '正在为您切换中文';
          break;
        case 'en_us':
          tips = 'Switching English for you';
          break;
      }
      const id = message.loading(tips, {nzDuration: 0}).messageId;
      setTimeout(() => {
        this.message.remove(id);
        this.locale = locale;
      }, 1450);
    });
  }

  setLocale(locale: 'zh_cn' | 'en_us') {
    this.locale = locale;
    localStorage.setItem('locale', locale);
    this.events.publish('locale', locale);
    this.l = Object.assign(this.common_language[this.locale], this.language[this.locale]);
  }

  registerLocales(packer: any, common = false) {
    if (common) {
      this.common_language = factoryLocales(packer);
    } else {
      this.language = factoryLocales(packer);
      this.l = Object.assign(this.common_language[this.locale], this.language[this.locale]);
    }
  }

  setMenu(data: any): Observable<boolean> {
    return this.storage.setItem('menu', data.menu).pipe(
      switchMap(status => {
        if (status) {
          return this.storage.setItem('route', data.route);
        }
      })
    );
  }

  private checkRouterEmpty(route: string, set = false): Observable<any> {
    return this.storage.getItem('menu').pipe(
      switchMap(data => {
        if (set) {
          this.menu = data;
        }
        return this.storage.getItem('route');
      }),
      map((data: Map<string, any>) => {
        const status = data.has(route);
        if (status && set) {
          return data.get(route);
        } else {
          return status;
        }
      }),
    );
  }

  getMenu(route: string): Observable<any> {
    this.actives = [];
    this.breadcrumb = [];
    this.path = 0;
    return this.checkRouterEmpty(route, true).pipe(
      map(data => {
        if (!data) {
          return false;
        }
        this.actives.unshift(data.id);
        const bread = {
          name: data.name,
          routerlink: 0
        };
        this.breadcrumb.unshift(bread);
        if (data.parent !== 0) {
          this.infiniteMenu(data.parent);
        }
        return {
          actives: this.actives,
          breadcrumb: this.breadcrumb
        };
      })
    );
  }

  private infiniteMenu(parent: number) {
    const data = this.menu.get(parent);
    this.actives.unshift(data.id);
    const bread = {
      name: data.name,
      routerlink: (data.routerlink) ? '../'.repeat(this.path++) : 0
    };
    this.breadcrumb.unshift(bread);
    if (data.parent !== 0) {
      this.infiniteMenu(data.parent);
    }
  }

  i18nControls(options?: I18nControlsOptions) {
    if (options === undefined) {
      options = {};
    }
    const controls = {};
    for (const x of this.config.i18n) {
      controls[x] = [
        i18nControlsValue(x, (options.value === undefined ? '' : options.value)),
        i18nControlsValidate(x, options.validate === undefined ? '' : options.validate),
        i18nControlsAsyncValidate(x, options.asyncValidate === undefined ? '' : options.asyncValidate)
      ];
    }
    return controls;
  }

  formExplain(name: string, async = false): ValidationErrors | boolean {
    if (async) {
      return this.form.get(name).dirty && this.form.get(name).errors || this.form.get(name).pending;
    } else {
      return this.form.get(name).dirty && this.form.get(name).errors;
    }
  }

  explain(name: string, sign: string): boolean {
    if (sign === 'pending') {
      return this.form.get(name).pending;
    } else {
      return this.form.get(name).hasError(sign);
    }
  }

  submit(event, callback) {
    event.preventDefault();
    if (this.form) {
      for (const key in this.form.controls) {
        if (this.form.controls.hasOwnProperty(key)) {
          this.form.controls[key].markAsDirty();
          this.form.controls[key].updateValueAndValidity();
        }
      }
      callback(this.form.value);
    }
  }

  back() {
    this.breadcrumb = [];
    this.actives = [];
    this.location.back();
  }

  listsRefreshStatus(lists: any[]) {
    const all_checked = lists.every(value => value.checked === true);
    const all_unchecked = lists.every(value => !value.checked);
    this.lists_all_checked = all_checked;
    this.lists_indeterminate = (!all_checked) && (!all_unchecked);
    this.lists_disabled_action = !(this.lists_all_checked || this.lists_indeterminate);
    this.lists_checked_number = lists.filter(value => value.checked).length;
  }

  listsCheckAll(event, lists: any[]) {
    lists.forEach(data => data.checked = event);
    this.listsRefreshStatus(lists);
  }

  statusChange(service: Observable<any>, custom?: any) {
    service.subscribe(res => {
      if (!res.error) {
        this.notification.success(this.l['operate_success'], this.l['status_success']);
      } else {
        if (custom && typeof custom === 'function') {
          custom(res);
        } else {
          this.notification.error(this.l['operate_error'], this.l['status_error']);
        }
      }
    });
  }
}
