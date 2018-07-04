import { ResourceApiService } from '../resource-api.service';
import { SpyObject } from './helper.mock';
import Spy = jasmine.Spy;

export class MockResourceApiService extends SpyObject {
  searchResourcesSpy: Spy;
  getCategoriesSpy: Spy;
  getCategorySpy: Spy;
  getCategoryResourcesSpy: Spy;
  updateCategorySpy: Spy;
  addCategorySpy: Spy;
  deleteCategorySpy: Spy;
  getIconsSpy: Spy;
  getResourceSpy: Spy;
  updateResourceSpy: Spy;
  addResourceSpy: Spy;
  linkResourceAndCategorySpy: Spy;
  deleteResourceSpy: Spy;
  fakeResponse: any;

  constructor() {
    super(ResourceApiService);
    this.fakeResponse = null;
    this.searchResourcesSpy = this.spy('searchResources').andReturn(this);
    this.getCategoriesSpy = this.spy('getCategories').andReturn(this);
    this.getCategorySpy = this.spy('getCategory').andReturn(this);
    this.getCategoryResourcesSpy = this.spy('getCategoryResources').andReturn(this);
    this.updateCategorySpy = this.spy('updateCategory').andReturn(this);
    this.addCategorySpy = this.spy('addCategory').andReturn(this);
    this.deleteCategorySpy = this.spy('deleteCategory').andReturn(this);
    this.getIconsSpy = this.spy('getIcons').andReturn(this);
    this.getResourceSpy = this.spy('getResource').andReturn(this);
    this.updateResourceSpy = this.spy('updateResource').andReturn(this);
    this.addResourceSpy = this.spy('addResource').andReturn(this);
    this.linkResourceAndCategorySpy = this.spy('linkResourceAndCategory').andReturn(this);
    this.deleteResourceSpy = this.spy('deleteResource').andReturn(this);
  }

  subscribe(callback: any) {
    callback(this.fakeResponse);
  }

  setResponse(json: any): void {
    this.fakeResponse = json;
  }
}
