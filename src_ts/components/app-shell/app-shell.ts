/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// import { LitElement, html, property, PropertyValues } from '@polymer/lit-element';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';
import {installRouter} from 'pwa-helpers/router.js';

// This element is connected to the Redux store.
import {store, RootState} from '../../store';

// These are the actions needed by this element.
import {
  navigate,
  // updateOffline,
  updateDrawerState
} from '../../actions/app';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import {AppShellStyles} from './app-shell-styles';

import './menu/app-menu.js';
import './header/page-header.js';
import './footer/page-footer.js';

import './app-theme.js';
import {property} from '@polymer/decorators/lib/decorators';
import {AppMenuHelper} from './menu/app-menu-helper';
import {ToastNotificationHelper} from '../common/toast-notifications/toast-notification-helper';
import user from '../../reducers/user';
import {ROOT_PATH} from '../../config/config';
import {getCurrentUserData} from '../user/user-actions';
// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

setRootPath(ROOT_PATH);

store.addReducers({
  user
});

/**
 * @customElement
 * @polymer
 */
class AppShell extends connect(store)(PolymerElement) {

  public static get template() {
    // main template
    // language=HTML
    return html`
    ${AppShellStyles}
   
    <app-drawer-layout id="layout" responsive-width="850px"
                       fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
      <!-- Drawer content -->
      <app-drawer id="drawer" slot="drawer" transition-duration="350" 
                  opened="[[_drawerOpened]]"
                  swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
        <!-- App main menu(left sidebar) -->
        <app-menu root-path="[[rootPath]]"
                  selected-option="[[_page]]"
                  small-menu$="[[smallMenu]]"></app-menu>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>

        <app-header slot="header" fixed shadow>
          <page-header id="pageheader" title="eTools"></page-header>
        </app-header>

        <!-- Main content -->
        <main role="main" class="main-content">
          <page-one class="page" active$="[[_isActivePage(_page, 'page-one')]]"></page-one>
          <page-two class="page" active$="[[_isActivePage(_page, 'page-two')]]"></page-two>
          <page-not-found class="page" active$="[[_isActivePage(_page, 'page-not-found')]]"></page-not-found>
        </main>

        <page-footer></page-footer>

      </app-header-layout>
    </app-drawer-layout>
    `;
  }

  @property({type: Boolean})
  _drawerOpened: boolean = false;

  @property({type: Boolean})
  _page: string = '';

  @property({type: Boolean})
  smallMenu: boolean = false;

  private appMenuHelper = {} as AppMenuHelper;
  private appToastsNotificationsHelper = {} as ToastNotificationHelper;

  constructor() {
    super();
    // init toasts notifications queue
    this.appToastsNotificationsHelper = new ToastNotificationHelper(this as PolymerElement);
    this.appToastsNotificationsHelper.addToastNotificationListeners();
  }

  public connectedCallback() {
    super.connectedCallback();
    // init app menu helper object and set small menu event listeners
    this.appMenuHelper = new AppMenuHelper(this as PolymerElement);
    this.appMenuHelper.initMenuListeners();
    this.appMenuHelper.initMenuSize();

    installRouter(location => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installMediaQueryWatcher(`(min-width: 460px)`,
      () => store.dispatch(updateDrawerState(false)));

    // TODO: just testing...
    getCurrentUserData();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    // use app menu helper object and remove small menu event listeners
    this.appMenuHelper.removeMenuListeners();
    // remove toasts notifications listeners
    this.appToastsNotificationsHelper.removeToastNotificationListeners();
  }

  public stateChanged(state: RootState) {
    this._page = state.app!.page;
    this._drawerOpened = state.app!.drawerOpened;
    console.log(state);
  }

  protected _isActivePage(_page: string, expectedPageName: string): boolean {
    return _page === expectedPageName;
  }
}

window.customElements.define('app-shell', AppShell);