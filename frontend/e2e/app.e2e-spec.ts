import { AppPage } from './app.po';

describe('Anonymous User app', () => {
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
        .getElements('#logomark-link')
        .first()
        .getAttribute('href')
    ).toEqual('http://localhost:4200/#');
  });

  it('should link back to www.ithriv.org', () => {
    expect(
      page
        .getElements('#logo-horizontal-link')
        .first()
        .getAttribute('href')
    ).toEqual('http://www.ithriv.org/');
  });

  it('should display categories', () => {
    expect(page.getElements('app-category-tile').count()).toBeGreaterThan(0);
  });

  it('should display resources', () => {
    page.clickElement('#mat-tab-label-0-1');
    expect(page.getElements('app-resource-tile').count()).toBeGreaterThan(0);
  });

  it('should click on resource tile', () => {
    const resourceElement = page.getElements('app-resource-tile').first();
    resourceElement.getAttribute('id').then(id => {
      const resourceId = id.split('resource-tile-')[1];
      resourceElement.click();
      page.getUrl().then(url => {
        expect(url.split('#')[1]).toEqual(`/resource/${resourceId}`);
      });
    });
  });

  it('should show resource details');

  it('should link to resource website');

  it('should link to suggest edits');

  it('should link to discussion forum');

  it('should request new login');

});
