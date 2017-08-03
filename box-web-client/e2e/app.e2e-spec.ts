import { BoxWebClientPage } from './app.po';

describe('box-web-client App', () => {
  let page: BoxWebClientPage;

  beforeEach(() => {
    page = new BoxWebClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
