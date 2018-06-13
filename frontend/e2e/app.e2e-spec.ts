import { AppPage } from './app.po';

describe('Anonymous User app', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });

  it('should display resources');

  it('should display categories');

  it('should click on resource icon');

  it('should show resource details');

  it('should link to resource website');

  it('should link to suggest edits');

  it('should link to discussion forum');

  it('should navigate back to the home page');

  it('should link to login form');

  it('should request new login');

});
