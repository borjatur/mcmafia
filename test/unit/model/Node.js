const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const Node = require('../../../server/app/model/Node');

const { expect } = Code;
const { it, describe } = exports.lab = Lab.script();

describe('(Model)', () => {

  describe('(Node)', () => {

    describe('(Constructor)', () => {

      it('default constructor should initialize payload, parent and children properties', () => {
        const node = new Node();

        expect(node.payload).to.exist();
        expect(node.parent).to.be.null();
        expect(node.children).to.have.length(0);
      });

      it('constructor should allow to fill a node payload with an object', () => {
        const node = new Node({ var: 'foo' });

        expect(node.payload).to.equal({ var: 'foo' });
      });
    });

    it('should create a child node calling createChildNode from a given payload', () => {
      const node = new Node();
      const child = node.createChildNode({ var: 'foo' });

      expect(node.children).to.have.length(1);
      expect(node.children[0]).to.equal(child);
      expect(child.parent).to.equal(node);
      expect(child.payload).to.equal({ var: 'foo' });
    });

    it('should add a given node to children calling appendChildNode', () => {
      const node = new Node();
      const child = new Node({ var: 'foo' });
      node.appendChildNode(child);

      expect(node.children).to.have.length(1);
      expect(node.children[0]).to.equal(child);
      expect(child.parent).to.equal(node);
      expect(child.payload).to.equal({ var: 'foo' });
    });

    it('should remove given child node calling removeChildNode', () => {
      const node = new Node();
      const child = node.createChildNode();

      expect(node.children).to.equal([child]);

      node.removeChildNode(child);

      expect(node.children).to.equal([]);
    });

    it('should change a node parent by calling setParent', () => {
      const node = new Node();
      const parent = new Node();

      node.setParent(parent);

      expect(node.parent).to.equal(parent);
    });

    it('should return true calling hasChildNode when node is a child', () => {
      const node = new Node();
      const child = new Node({ var: 'foo' });
      node.appendChildNode(child);

      expect(node.hasChildNode(child)).to.be.true();
    });

    it('should return false calling hasChildNode when node is not a child', () => {
      const node = new Node();
      const nonChild = new Node();

      expect(node.hasChildNode(nonChild)).to.be.false();
    });

    describe('(getNumberOfSubnodes)', () => {

      it('should return number of sub nodes from a node without childrens', () => {
        const node = new Node();

        expect(node.getNumberOfSubnodes()).to.equal(0);
      });

      it('should return number of sub nodes from a node with a deep subtree', () => {
        const node = new Node({ id: 'a' });
        node
          .createChildNode({ id: 'b' })
          .createChildNode({ id: 'c' })
          .createChildNode({ id: 'd' });

        expect(node.getNumberOfSubnodes()).to.equal(3);
      });

      it('should return number of sub nodes from a node with a wide subtree', () => {
        const node = new Node({ id: 'a' });
        node
          .createChildNode({ id: 'b' })
          .createChildNode({ id: 'e' });
        node
          .createChildNode({ id: 'c' })
          .createChildNode({ id: 'f' });
        node.createChildNode({ id: 'd' });

        expect(node.getNumberOfSubnodes()).to.equal(5);
      });
    });

    describe('(Errors)', () => {

      it('should throw an Error when trying to have a child node that is a self reference', () => {
        const node = new Node();
        try {
          node.appendChildNode(node);
          expect(true).to.equal(false);
        } catch (err) {
          expect(err instanceof Error).to.be.true();
          expect(err.message).to.equal('A node can not have a child reference to itself');
        }
      });

      it('should throw an Error when trying to remove a child node that does not exist', () => {
        const node1 = new Node();
        const node2 = new Node();
        try {
          node1.removeChildNode(node2);
          expect(true).to.equal(false);
        } catch (err) {
          expect(err instanceof Error).to.be.true();
          expect(err.message).to.equal('can not remove a child node that is not a current children');
        }
      });
    });
  });
});

