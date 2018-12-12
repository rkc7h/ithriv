import { ResourceApiService } from '../resource-api/resource-api.service';
import { SpyObject } from './helper.mock';
import Spy = jasmine.Spy;

export class MockResourceApiService extends SpyObject {

  getSessionSpy: Spy;
  _fetchSessionSpy: Spy;
  openSessionSpy: Spy;
  closeSessionSpy: Spy;
  loginUserSpy: Spy;
  updateViewPreferencesSpy: Spy;
  getViewPreferencesSpy: Spy;
  searchResourcesSpy: Spy;
  getCategoriesSpy: Spy;
  getRootCategoriesSpy: Spy;
  getCategorySpy: Spy;
  getCategoryResourcesSpy: Spy;
  updateCategorySpy: Spy;
  addCategorySpy: Spy;
  deleteCategorySpy: Spy;
  getIconsSpy: Spy;
  getInstitutionsSpy: Spy;
  getAvailabilityInstitutionsSpy: Spy;
  getInstitutionSpy: Spy;
  getTypesSpy: Spy;
  getResourceSpy: Spy;
  getResourcesSpy: Spy;
  getResourceCategoriesSpy: Spy;
  updateResourceCategoriesSpy: Spy;
  updateResourceSpy: Spy;
  updateResourceAvailabilitySpy: Spy;
  addResourceSpy: Spy;
  linkResourceAndCategorySpy: Spy;
  unlinkResourceAndCategorySpy: Spy;
  unlinkResourceAndAttachmentSpy: Spy;
  linkResourceAndAttachmentSpy: Spy;
  deleteResourceSpy: Spy;
  getResourceAttachmentsSpy: Spy;
  getResourceAttachmentSpy: Spy;
  getAttachmentsByResourcesSpy: Spy;
  updateResourceAttachmentSpy: Spy;
  addResourceAttachmentSpy: Spy;
  getFileAttachmentSpy: Spy;
  addFileAttachmentSpy: Spy;
  addFileAttachmentBlobSpy: Spy;
  updateFileAttachmentSpy: Spy;
  getFileAttachmentBlobSpy: Spy;
  deleteFileAttachmentSpy: Spy;
  getUserResourcesSpy: Spy;
  addFavoriteSpy: Spy;
  deleteFavoriteSpy: Spy;
  getUserFavoritesSpy: Spy;
  getUserSpy: Spy;
  updateUserSpy: Spy;
  addUserSpy: Spy;
  deleteUserSpy: Spy;
  findUsersSpy: Spy;
  sendResetPasswordEmailSpy: Spy;
  resetPasswordSpy: Spy;
  sendConsultRequestEmailSpy: Spy;
  sendApprovalRequestEmailSpy: Spy;
  showProgressSpy: Spy;
  fakeResponse: any;

  constructor() {
    super(ResourceApiService);
    this.fakeResponse = null;
    this.getSessionSpy = this.spy('getSession').andReturn(this);
    this._fetchSessionSpy = this.spy('_fetchSession').andReturn(this);
    this.openSessionSpy = this.spy('openSession').andReturn(this);
    this.closeSessionSpy = this.spy('closeSession').andReturn(this);
    this.loginUserSpy = this.spy('loginUser').andReturn(this);
    this.updateViewPreferencesSpy = this.spy('updateViewPreferences').andReturn(this);
    this.getViewPreferencesSpy = this.spy('getViewPreferences').andReturn(this);
    this.searchResourcesSpy = this.spy('searchResources').andReturn(this);
    this.getCategoriesSpy = this.spy('getCategories').andReturn(this);
    this.getRootCategoriesSpy = this.spy('getRootCategories').andReturn(this);
    this.getCategorySpy = this.spy('getCategory').andReturn(this);
    this.getCategoryResourcesSpy = this.spy('getCategoryResources').andReturn(this);
    this.updateCategorySpy = this.spy('updateCategory').andReturn(this);
    this.addCategorySpy = this.spy('addCategory').andReturn(this);
    this.deleteCategorySpy = this.spy('deleteCategory').andReturn(this);
    this.getIconsSpy = this.spy('getIcons').andReturn(this);
    this.getInstitutionsSpy = this.spy('getInstitutions').andReturn(this);
    this.getAvailabilityInstitutionsSpy = this.spy('getAvailabilityInstitutions').andReturn(this);
    this.getInstitutionSpy = this.spy('getInstitution').andReturn(this);
    this.getTypesSpy = this.spy('getTypes').andReturn(this);
    this.getResourceSpy = this.spy('getResource').andReturn(this);
    this.getResourcesSpy = this.spy('getResources').andReturn(this);
    this.getResourceCategoriesSpy = this.spy('getResourceCategories').andReturn(this);
    this.updateResourceCategoriesSpy = this.spy('updateResourceCategories').andReturn(this);
    this.updateResourceSpy = this.spy('updateResource').andReturn(this);
    this.updateResourceAvailabilitySpy = this.spy('updateResourceAvailability').andReturn(this);
    this.addResourceSpy = this.spy('addResource').andReturn(this);
    this.unlinkResourceAndCategorySpy = this.spy('unlinkResourceAndCategory').andReturn(this);
    this.linkResourceAndCategorySpy = this.spy('linkResourceAndCategory').andReturn(this);
    this.unlinkResourceAndAttachmentSpy = this.spy('unlinkResourceAndAttachment').andReturn(this);
    this.linkResourceAndAttachmentSpy = this.spy('linkResourceAndAttachment').andReturn(this);
    this.deleteResourceSpy = this.spy('deleteResource').andReturn(this);
    this.getResourceAttachmentsSpy = this.spy('getResourceAttachments').andReturn(this);
    this.getResourceAttachmentSpy = this.spy('getResourceAttachment').andReturn(this);
    this.getAttachmentsByResourcesSpy = this.spy('getAttachmentsByResources').andReturn(this);
    this.updateResourceAttachmentSpy = this.spy('updateResourceAttachment').andReturn(this);
    this.addResourceAttachmentSpy = this.spy('addResourceAttachment').andReturn(this);
    this.getFileAttachmentSpy = this.spy('getFileAttachment').andReturn(this);
    this.addFileAttachmentSpy = this.spy('addFileAttachment').andReturn(this);
    this.addFileAttachmentBlobSpy = this.spy('addFileAttachmentBlob').andReturn(this);
    this.updateFileAttachmentSpy = this.spy('updateFileAttachment').andReturn(this);
    this.getFileAttachmentBlobSpy = this.spy('getFileAttachmentBlob').andReturn(this);
    this.deleteFileAttachmentSpy = this.spy('deleteFileAttachment').andReturn(this);
    this.getUserResourcesSpy = this.spy('getUserResources').andReturn(this);
    this.addFavoriteSpy = this.spy('addFavorite').andReturn(this);
    this.deleteFavoriteSpy = this.spy('deleteFavorite').andReturn(this);
    this.getUserFavoritesSpy = this.spy('getUserFavorites').andReturn(this);
    this.getUserSpy = this.spy('getUser').andReturn(this);
    this.updateUserSpy = this.spy('updateUser').andReturn(this);
    this.addUserSpy = this.spy('addUser').andReturn(this);
    this.deleteUserSpy = this.spy('deleteUser').andReturn(this);
    this.findUsersSpy = this.spy('findUsers').andReturn(this);
    this.sendResetPasswordEmailSpy = this.spy('sendResetPasswordEmail').andReturn(this);
    this.resetPasswordSpy = this.spy('resetPassword').andReturn(this);
    this.sendConsultRequestEmailSpy = this.spy('sendConsultRequestEmail').andReturn(this);
    this.sendApprovalRequestEmailSpy = this.spy('sendApprovalRequestEmail').andReturn(this);
    this.showProgressSpy = this.spy('showProgress').andReturn(this);
  }

  subscribe(callback: any) {
    callback(this.fakeResponse);
  }

  setResponse(json: any): void {
    this.fakeResponse = json;
  }

  spyAndReturnFake(methodName: string, fakeResponse: any) {
    this.spy(methodName).andReturn({ subscribe: callback => callback(fakeResponse) });
  }
}
