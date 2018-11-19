import { browser, by, element } from 'protractor';

export class AppPage {

  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  clickElement(selector: string) {
    element(by.css(selector)).click();
  }

  getElements(selector: string) {
    return element.all(by.css(selector));
  }

  getUrl() {
    return browser.getCurrentUrl();
  }
}
