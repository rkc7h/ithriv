export class NodeOptions {
  relationship: string; // 'parent'|'self'|'sibling'|'child'|'grandchild'
  x: number;
  y: number;
  radius: number;
  angle: number;
  titleHeight: number;

  constructor(private _props) {
    for (const propName in this._props) {
      if (this._props.hasOwnProperty(propName)) {
        this[propName] = this._props[propName];
      }
    }
  }
}
