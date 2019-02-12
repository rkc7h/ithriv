import { AppPage } from './app.po';
import { by, element } from 'protractor';

describe('Anonymous User', () => {
  let page: AppPage;

  beforeAll(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display login button', () => {
    expect(page.getElements('#login-button').count()).toBeGreaterThan(0);
  });

  it('should display sitewide header', () => {
    expect(page.getElements('.menubar').count()).toBeGreaterThan(0);
  });

  it('should display global navigation', () => {
    expect(page.getElements('.logo').count()).toBeGreaterThan(0);
  });

  it('should display secondary navigation', () => {
    expect(page.getElements('.secondary-nav').count()).toBeGreaterThan(0);
  });

  it('should display welcome message', () => {
    expect(page.getParagraphText()).toEqual('Research Concierge Portal');
  });

  it('should link back to the home page', () => {
    expect(
      page
        .getElement('#logomark-link')
        .getAttribute('href')
    ).toEqual('http://localhost:4200/#/');
  });

  it('should link back to www.ithriv.org', () => {
    expect(
      page
        .getElement('#logo-horizontal-link')
        .getAttribute('href')
    ).toEqual('http://www.ithriv.org/');
  });

  it('should display categories', () => {
    expect(page.getElements('app-category-tile').count()).toBeGreaterThan(0);
  });

  it('should display resources', () => {
    page.waitForVisible('.mat-tab-label');
    const tabLabels = element.all(by.css('.mat-tab-label'));
    expect(tabLabels.count()).toBeGreaterThan(0);
    tabLabels.get(1).click();
    page.waitForVisible('app-resource-tile');
    expect(page.getElements('app-resource-tile').count()).toBeGreaterThan(0);
  });

  it('should not be able to see private resource', async () => {
    expect(page.getElements('app-resource-tile .resource.private').count()).toEqual(0);
  });

  it('should click on resource tile', () => {
    const resourceElement = page.getElement('app-resource-tile');
    resourceElement.getAttribute('id').then(id => {
      const resourceId = id.split('resource-tile-')[1];
      resourceElement.click();
      page.getUrl().then(url => {
        expect(url.split('#')[1]).toEqual(`/resource/${resourceId}`);
      });
    });
  });

  it('should link to resource website', () => {
    page.waitForAnimations();
    expect(page.getElements('#resource-website').count()).toBeGreaterThan(0);
    expect(page.getElements('#resource-actions-website').count()).toBeGreaterThan(0);
  });

  it('should not show link to resource editing form', () => {
    expect(page.getElements('#resource-edit').count()).toEqual(0);
    expect(page.getElements('app-edit-resource-button button').count()).toEqual(0);
  });

  it('should not show resource approval status', async () => {
    expect(page.getElements('app-approved-badge .ribbon').count()).toEqual(0);
  });

  it('should not show resource private setting', async () => {
    expect(page.getElements('#button-not-private').count()).toEqual(0);
    expect(page.getElements('#button-private').count()).toEqual(0);
  });

});
