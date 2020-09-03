class Node {

  constructor(payload = {}) {
    this.payload = payload;
    this.parent = null;
    this.children = [];
  }

  createChildNode(payload) {
    const child = new Node(payload);
    this.appendChildNode(child);
    return child;
  }

  appendChildNode(node) {
    if (node === this) {
      throw new Error('A node can not have a child reference to itself');
    }
    node.setParent(this);
    if (!this.children.some(e => e.payload.id === node.payload.id)) {
      this.children.push(node);
    }
  }

  removeChildNode(node) {
    const index = this.children.findIndex((c) => {
      return c.payload.id === node.payload.id
    });
    if (index < 0) {
      throw new Error('can not remove a child node that is not a current children');
    }
    this.children.splice(index, 1);
    return node;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
  }

  setParent(node) {
    if (node === this) {
      throw new Error('A node can not have a parent reference to itself');
    }
    this.parent = node;
  }

  traverse(callback) {
    for (let child of this.children) {
      if (callback(child) === true || child.traverse(callback) === true) {
        return true;
      }
    }
  }

  getNumberOfSubnodes() {
    return this.children.reduce((prev, current) => {
      return prev + current.getNumberOfSubnodes();
    }, this.children.length);
  }

  findNodeById(id) {
    if (id === this.payload.id) {
      return this;
    }
    let foundNode;
    this.traverse((node) => {
      if (node.payload.id === id) {
        foundNode = node;
        return true;
      }
    });
    return foundNode;
  }

  hasChildNode(node) {
    const found = this.children.find(c => c === node);
    return found ? true : false;
  };

  getNodeDepth() {
    if (!this.children.length) {
      return 0;
    }
    const childDepths = this.children.map(child => child.getNodeDepth());
    return 1 + Math.max(...childDepths);
  }

  getDepthByNodeId(id, currenDepth = 0) {
    if (this.payload.id === id) {
      return currenDepth;
    }
    for (let child of this.children) {
      const childDepth = child.getDepthByNodeId(id, currenDepth + 1);
      if (childDepth !== undefined) {
        return childDepth;
      }
    }
  }

  getSiblings() {
    if (this.parent) {
      return this.parent.children.filter(s => s.getPayload().id !== this.payload.id);
    }
    return [];
  }

  flatten() {
    return {
      ...this.payload,
      children: this.children.map(c => c.payload.id),
      parent: this.parent === null ? null : this.parent.payload.id
    }
  }

  getPayload() {
    return this.payload;
  }

  findAncestorBy(callback) {
    if (this.parent === null) {
      return;
    }
    if (callback(this.parent) === true || this.parent.findAncestorBy(callback) === true) {
      return true;
    }
  }

  isRoot() {
    return this.parent === null;
  }

  toString(spaceCount = 0, prop = 'id') {
    let strRepresentation;
    if (spaceCount === 0) {
      strRepresentation = `\n${this.payload[prop]}\n`
    } else {
      strRepresentation = `${' '.repeat(spaceCount)}|_${this.payload[prop]}\n`
    }
    this.children.forEach((c) => {
      strRepresentation += c.toString(spaceCount + 2, prop);
    })
    return strRepresentation;
  }
}

module.exports = Node;