const _ = require('lodash');
const Node = require('./Node');

const compareFunction = (m1, m2) => (new Date(m1.getPayload().startedAt) - new Date(m2.getPayload().startedAt));

const mapNodeReferencesToNodes = (dictionary, element) => {
  const node = dictionary[element.id];
  element.children.forEach((c) => {
    if (!dictionary[c]) {
      throw new Error(`There is a reference to an non existing member: ${c}`);
    }
    node.appendChildNode(dictionary[c]);
  });
  if (element.parent !== null && !dictionary[element.parent]) {
    throw new Error(`There is a reference to an non existing member: ${element.parent}`);
  }
  node.setParent(dictionary[element.parent] || null);
  return node;
};

class Organization {

  constructor(members = []) {
    const nodesDictionary = members.reduce((prev, current) => {
      prev[current.id] = new Node(_.omit(current, 'parent', 'children'));
      return prev;
    }, {});
    this.membersInJail = members.filter(m => m.jail).map(m => {
      return mapNodeReferencesToNodes(nodesDictionary, m);
    });
    this.activeMembers = members.filter(m => !m.jail).map(m => {
      return mapNodeReferencesToNodes(nodesDictionary, m);
    }).find(m => m.getParent() === null);
  }

  findReplacement(member) {
    const siblings = member.getSiblings();
    if (siblings.length) { //replacement from oldest equal
      return _.head(siblings.sort(compareFunction));
    }
    return _.head(member.children.sort(compareFunction)); //replacement from oldest children
  }

  imprision(id) {
    const memberToImprision = this.activeMembers.findNodeById(id);
    if (!memberToImprision) {
      throw new Error(`Can not imprision a non existing member: ${id}`);
    }
    const replacement = this.findReplacement(memberToImprision);
    if (!replacement) {
      throw new Error(`There is no current replacement for member: ${id}`);
    }
    memberToImprision.getChildren().filter(c => c !== replacement).forEach((c) => {
      replacement.appendChildNode(c);
    });

    if (memberToImprision.isRoot()) {
      replacement.setParent(null);
      this.activeMembers = replacement;
    } else {
      memberToImprision.getParent().appendChildNode(replacement); //create or recreate edge parent(memberToImprision) -> children[replacement)]
      memberToImprision.getParent().removeChildNode(memberToImprision); //remove edge parent(memberToImprision) -> children[memberToImprision]
    }
    memberToImprision.getPayload().jail = true;
    this.membersInJail.push(memberToImprision);
    return memberToImprision;
  }

  release(id) {
    const memberIndex = this.membersInJail.findIndex(m => m.payload.id === id);
    if (memberIndex < 0) {
      throw new Error(`Can not release a non imprisioned member: ${id}`);
    }
    const memberToRelease = this.membersInJail[memberIndex];
    this.membersInJail.splice(memberIndex, 1);

    memberToRelease.getChildren().forEach((c) => {
      if (c.getPayload().jail) {
        memberToRelease.removeChildNode(c);
      } else {
        if (!c.isRoot()) {
          c.getParent().removeChildNode(c);
        }
        memberToRelease.appendChildNode(c);
      }
    });
    memberToRelease.findAncestorBy(ancestor => {
      if (!ancestor.getPayload().jail) {
        ancestor.appendChildNode(memberToRelease);
        return true;
      }
    });
    if (memberToRelease.isRoot()) {
      this.activeMembers = memberToRelease;
    }
    memberToRelease.getPayload().jail = false;
    return memberToRelease;
  }

  getOrganizationList() {
    const membersList = this.membersInJail.map(m => m.flatten());
    membersList.push(this.activeMembers.flatten());
    this.activeMembers.traverse((member) => {
      membersList.push(member.flatten());
    });
    return membersList;
  }

  getImprisionedMember(id) {
    return this.membersInJail.find(m => m.getPayload().id === id);
  }

  getNumberOfSubordinates(id) {
    const member = this.activeMembers.findNodeById(id);
    if (!member) {
      throw new Error(`Can not return number of subordinates of a non existing member: ${id}`);
    }
    return member.getNumberOfSubnodes();
  }

  getMemberLevel(id) {
    const member = this.activeMembers.findNodeById(id);
    if (!member) {
      throw new Error(`Can not get the level of a non existing member: ${id}`);
    }
    return member.getNodeDepth();
  }

  getMainBoss() {
    return this.activeMembers;
  }
}

module.exports = Organization;