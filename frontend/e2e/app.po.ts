import { browser, by, element, ExpectedConditions } from 'protractor';

export class AppPage {

  waitForAnimations() {
    browser.sleep(3000);
  }

  waitForStale(selector: string) {
    const e = this.getElement(selector);
    browser.wait(ExpectedConditions.stalenessOf(e), 5000);
  }

  waitForClickable(selector: string) {
    const e = this.getElement(selector);
    browser.wait(ExpectedConditions.elementToBeClickable(e), 5000);
  }

  waitForVisible(selector: string) {
    const e = this.getElement(selector);
    browser.wait(ExpectedConditions.visibilityOf(e), 5000);
  }

  getSessionStorageVar(key: string) {
    return browser.executeScript(`return window.sessionStorage.getItem('${key}');`);
  }

  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return this.getElement('app-root h1').getText();
  }

  clickElement(selector: string) {
    this.getElement(selector).click();
  }

  isVisible(selector: string) {
    return this.getElement(selector).isDisplayed();
  }

  getElement(selector: string) {
    return element.all(by.css(selector)).first();
  }

  getElements(selector: string) {
    return element.all(by.css(selector));
  }

  getUrl() {
    return browser.getCurrentUrl();
  }
}
