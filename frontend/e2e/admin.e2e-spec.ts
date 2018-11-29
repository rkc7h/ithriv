import { AppPage } from './app.po';
import { by, element } from 'protractor';

describe('Admin User', () => {
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
    ).toEqual('http://localhost:4200/#');
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

  it('should click the log in button', async () => {
    page.clickElement('#login-button');
    const url = await page.getUrl();
    expect(url.split('#')[1]).toEqual(`/login`);
  });

  it('should display login services', () => {
    page.waitForVisible('.login-service');
    expect(page.getElements('.login-service').count()).toBeGreaterThan(0);
  });

  it('should click the second login service', async () => {
    page.waitForVisible('.service-logo');
    page.getElements('.service-logo').get(1).click();
    const institution_id = await page.getSessionStorageVar('institution_id');
    expect(institution_id).toBeTruthy();
    expect(page.isVisible('#btn-institution-' + institution_id)).toBeTruthy();
  });

  it('should display system admin login option', () => {
    page.waitForVisible('.mat-tab-label');
    const tabLabels = element.all(by.css('.mat-tab-label'));
    expect(tabLabels.get(1).getText()).toEqual('SYSTEM ADMIN LOGIN');
  });

  it('should click the system admin login tab', () => {
    const tabLabels = element.all(by.css('.mat-tab-label'));
    expect(tabLabels.count()).toBeGreaterThan(0);
    tabLabels.get(1).click();
    page.waitForVisible('[placeholder="Email"]');
    page.waitForVisible('[placeholder="Password"]');
  });

  it('should fill in admin user credentials', () => {
    const email = 'ajlouie@gmail.com';
    const password = 'alouie2';
    const emailField = page.getElement('[placeholder="Email"]');
    const passwordField = page.getElement('[placeholder="Password"]');
    emailField.sendKeys(email);
    expect(emailField.getAttribute('value')).toEqual(email);

    passwordField.sendKeys(password);
    expect(passwordField.getAttribute('value')).toEqual(password);
  });

  it('should log in as system admin', async () => {
    page.clickElement('#submit');
    page.waitForVisible('#logout-button');
    const url = await page.getUrl();
    expect(url.split('#')[1]).toEqual(`/home`);
  });

  it('should display resources', () => {
    page.waitForVisible('.mat-tab-label');
    const tabLabels = element.all(by.css('.mat-tab-label'));
    expect(tabLabels.count()).toBeGreaterThan(0);
    tabLabels.get(1).click();
    page.waitForVisible('app-resource-tile');
    expect(page.getElements('app-resource-tile').count()).toBeGreaterThan(0);
  });

  it('should click on resource tile', async () => {
    const resourceElement = page.getElement('app-resource-tile');
    const id = await resourceElement.getAttribute('id');
    const resourceId = id.split('resource-tile-')[1];
    resourceElement.click();
    const url = await page.getUrl();
    expect(url.split('#')[1]).toEqual(`/resource/${resourceId}`);
  });

  it('should link to resource website', () => {
    page.waitForAnimations();
    expect(page.getElements('#resource-website').count()).toBeGreaterThan(0);
    expect(page.getElements('#resource-actions-website').count()).toBeGreaterThan(0);
  });

  it('should link to resource editing form', () => {
    expect(page.getElements('#resource-edit').count()).toBeGreaterThan(0);
    expect(page.getElements('app-edit-resource-button').count()).toBeGreaterThan(0);
    page.clickElement('#resource-edit');
    page.waitForVisible('[placeholder="Resource Name"]');
  });

  it('should edit resource name', async () => {
    const nameField = page.getElement('[placeholder="Resource Name"]');
    const newName = 'New Name';

    nameField.clear();
    expect(nameField.getAttribute('value')).toEqual('');

    nameField.sendKeys(newName);
    expect(nameField.getAttribute('value')).toEqual(newName);
  });

  it('should edit resource owners', async () => {
    const email = 'ajlouie@gmail.com';
    const ownersField = page.getElement('[placeholder="Owners"]');

    ownersField.clear();
    expect(ownersField.getAttribute('value')).toEqual('');

    ownersField.sendKeys(email);
    expect(ownersField.getAttribute('value')).toEqual(email);
  });

  it('should edit resource website', async () => {
    const website = 'https://website.institution.edu';
    const websiteField = page.getElement('[placeholder="Website"]');

    websiteField.clear();
    expect(websiteField.getAttribute('value')).toEqual('');

    websiteField.sendKeys(website);
    expect(websiteField.getAttribute('value')).toEqual(website);
  });

  it('should mark resource as private', async () => {
    const privateField = page.getElement('[title="Private"]');
    expect(privateField.isPresent()).toEqual(true);

    const inputEl = page.getElement('[title="Private"] input');
    expect(inputEl.isPresent()).toEqual(true);

    const isSelected = await inputEl.isSelected();

    if (isSelected) {
      privateField.click();
      expect(inputEl.isSelected()).toEqual(false);
    }

    privateField.click();
    expect(inputEl.isSelected()).toEqual(true);
  });

  it('should save changes to resource', () => {
    page.clickElement('#save');
    page.waitForVisible('#resource-edit');
    page.waitForAnimations();
    expect(page.getElement('h1.resource-name').getText()).toEqual('New Name');
  });

  it('should approve resource', async () => {
    const badgeSelector = 'app-approved-badge .ribbon.clickable';
    const approvalBadge = page.getElement(badgeSelector);
    const status = await approvalBadge.getText();

    if (status === 'APPROVED') {
      // It's already approved. Unapprove it first.
      approvalBadge.element(by.css('span')).click();
      page.waitForAnimations();
    }

    expect(approvalBadge.getText()).toEqual('UNAPPROVED');
    approvalBadge.element(by.css('span')).click();
    page.waitForAnimations();
    expect(approvalBadge.getText()).toEqual('APPROVED');
  });

  it('should navigate to search screen', async () => {
    page.clickElement('#search-button');
    const url = await page.getUrl();
    expect(url.split('#')[1]).toEqual(`/search`);
  });

  it('should be able to see private resource', () => {
    expect(page.getElements('app-resource-tile .resource.private').count()).toBeGreaterThan(0);
  });

  it('should log out', async () => {
    const urlBefore = await page.getUrl();
    page.clickElement('#logout-button');
    page.waitForVisible('#login-button');
    const urlAfter = await page.getUrl();
    expect(urlAfter).toEqual(urlBefore);
  });

});
