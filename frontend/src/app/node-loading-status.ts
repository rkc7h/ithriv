export class NodeLoadingStatus {
  numChildren: number;
  numChildrenLoaded: number;

  constructor(private _props) {
    this.numChildren = 0;
    this.numChildren = -1;

    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}
