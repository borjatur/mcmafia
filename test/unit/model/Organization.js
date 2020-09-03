const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const Organization = require('../../../server/app/model/Organization');
const Node = require('../../../server/app/model/Node');

const { expect } = Code;
const { it, describe } = exports.lab = Lab.script();

describe('(Model)', () => {

  describe('(Organization)', () => {

    describe('(Constructor)', () => {

      it('default constructor should initialize an empty organization', () => {
        const organization = new Organization();

        expect(organization.activeMembers).to.be.undefined();
        expect(organization.membersInJail).to.be.empty();
      });

      it('constructor should build a members tree from a list of members that are not in jail', () => {
        const members = [
          {
            id: 'f653e12680054da7981684a23900632a',
            parent: null,
            name: 'boss',
            jail: false,
            children: [
              'c48ac60af8184d4f898230f41b77584e',
              '03061d6e58bc4c5dba66347885d3edd9'
            ]
          },
          {
            id: 'c48ac60af8184d4f898230f41b77584e',
            parent: 'f653e12680054da7981684a23900632a',
            name: 'underboss 1',
            jail: false,
            children: []
          },
          {
            id: '03061d6e58bc4c5dba66347885d3edd9',
            parent: 'f653e12680054da7981684a23900632a',
            name: 'underboss 2',
            jail: false,
            children: []
          }
        ];

        const { activeMembers, membersInJail } = new Organization(members);

        expect(activeMembers).to.be.an.instanceof(Node);
        expect(activeMembers.payload.id).to.equal('f653e12680054da7981684a23900632a');
        expect(activeMembers.parent).to.equal(null);
        expect(activeMembers.children).to.have.length(2);

        const child1 = activeMembers.children.find(c => c.payload.id === 'c48ac60af8184d4f898230f41b77584e');
        expect(child1).to.be.an.instanceof(Node);
        expect(child1.payload.id).to.equal('c48ac60af8184d4f898230f41b77584e');
        expect(child1.parent).to.equal(activeMembers);
        expect(child1.children).to.have.length(0);

        const child2 = activeMembers.children.find(c => c.payload.id === '03061d6e58bc4c5dba66347885d3edd9');
        expect(child2).to.be.an.instanceof(Node);
        expect(child2.payload.id).to.equal('03061d6e58bc4c5dba66347885d3edd9');
        expect(child2.parent).to.equal(activeMembers);
        expect(child2.children).to.have.length(0);

        expect(membersInJail).to.be.empty();
      });

      it('constructor should build a members tree from a list of members that are not in jail', () => {
        const members = [
          {
            id: 'f653e12680054da7981684a23900632a',
            parent: null,
            name: 'boss',
            jail: false,
            children: [
            ]
          },
          {
            id: '03061d6e58bc4c5dba66347885d3edd9',
            parent: 'f653e12680054da7981684a23900632a',
            name: 'underboss 2',
            jail: true,
            children: []
          }
        ];

        const { activeMembers, membersInJail } = new Organization(members);

        expect(activeMembers).to.be.an.instanceof(Node);
        expect(activeMembers.payload.id).to.equal('f653e12680054da7981684a23900632a');
        expect(activeMembers.parent).to.equal(null);
        expect(activeMembers.children).to.have.length(0);

        expect(membersInJail).to.have.length(1);
        expect(membersInJail[0].payload).to.equal({
          id: '03061d6e58bc4c5dba66347885d3edd9',
          name: 'underboss 2',
          jail: true
        });
        expect(membersInJail[0].getParent()).to.equal(activeMembers);
      });

      describe('(Errors)', () => {

        it('should throw an Error when the array of members contain references to non existing members', () => {

          const members = [
            {
              id: 'f653e12680054da7981684a23900632a',
              parent: null,
              name: 'boss',
              jail: false,
              children: [
                'c48ac60af8184d4f898230f41b77584e',
                'non-existing'
              ]
            },
            {
              id: 'c48ac60af8184d4f898230f41b77584e',
              parent: 'f653e12680054da7981684a23900632a',
              name: 'underboss 1',
              jail: false,
              children: []
            }
          ];

          expect(() => new Organization(members)).to.throw(Error, 'There is a reference to an non existing member: non-existing');
        });
      });
    });

    describe('(Imprision)', () => {

      const membersList = [
        {
          id: 'f653e12680054da7981684a23900632a',
          parent: null,
          name: 'boss',
          jail: false,
          children: [
            'c48ac60af8184d4f898230f41b77584e',
            '03061d6e58bc4c5dba66347885d3edd9',
            '20b44a51a39f4dd29b6e8255623451b3'
          ]
        },
        {
          id: 'c48ac60af8184d4f898230f41b77584e',
          parent: 'f653e12680054da7981684a23900632a',
          name: 'underboss 1',
          jail: false,
          children: ['31cd3865ef3f404b944ebd2d15f8c998']
        },
        {
          id: '03061d6e58bc4c5dba66347885d3edd9',
          parent: 'f653e12680054da7981684a23900632a',
          name: 'underboss 2',
          startedAt: '1985-06-05T14:48:00.000Z',
          jail: false,
          children: []
        },
        {
          id: '20b44a51a39f4dd29b6e8255623451b3',
          parent: 'f653e12680054da7981684a23900632a',
          name: 'underboss 3',
          startedAt: '1985-09-05T14:48:00.000Z',
          jail: false,
          children: []
        },
        {
          id: '31cd3865ef3f404b944ebd2d15f8c998',
          parent: 'c48ac60af8184d4f898230f41b77584e',
          name: 'underboss 4',
          jail: false,
          children: [
            'b73d8aa872ef4cd98b1bd1b2683905fd',
            '16c886a2657a467aae9353cc4397f42e'
          ]
        },
        {
          id: 'b73d8aa872ef4cd98b1bd1b2683905fd',
          parent: '31cd3865ef3f404b944ebd2d15f8c998',
          name: 'soldier 1',
          startedAt: '1985-06-05T14:48:00.000Z',
          jail: false,
          children: []
        },
        {
          id: '16c886a2657a467aae9353cc4397f42e',
          parent: '31cd3865ef3f404b944ebd2d15f8c998',
          name: 'soldier 2',
          startedAt: '1985-02-05T14:48:00.000Z',
          jail: false,
          children: []
        }
      ];

      describe('(Imprision a member with equals)', () => {

        //TODO DATES?

        it('should move the member to jail and relocate subordinates to its oldest equal', () => {

          const organization = new Organization(membersList);
          const imprisionedMember = organization.imprision('c48ac60af8184d4f898230f41b77584e');

          expect(organization.membersInJail).to.have.length(1);
          expect(organization.getImprisionedMember('c48ac60af8184d4f898230f41b77584e')).to.equal(imprisionedMember);
          expect(imprisionedMember.getParent().hasChildNode(imprisionedMember)).to.be.false();

          const replacement = organization.activeMembers.findNodeById('03061d6e58bc4c5dba66347885d3edd9');
          imprisionedMember.getChildren().forEach((children) => {
            expect(children.getParent()).to.equal(replacement);
          });

          expect(organization.activeMembers.findNodeById('c48ac60af8184d4f898230f41b77584e')).to.be.undefined();
        });
      });

      describe('(Imprision a member without equals)', () => {

        it('should promote the oldest subordinate to be the boss of its equals', () => {
          const organization = new Organization(membersList);
          const imprisionedMember = organization.imprision('31cd3865ef3f404b944ebd2d15f8c998');

          expect(organization.membersInJail).to.have.length(1);
          expect(organization.getImprisionedMember('31cd3865ef3f404b944ebd2d15f8c998')).to.equal(imprisionedMember);
          expect(imprisionedMember.getParent().hasChildNode(imprisionedMember)).to.be.false();

          const replacement = organization.activeMembers.findNodeById('16c886a2657a467aae9353cc4397f42e');
          expect(imprisionedMember.hasChildNode(replacement)).to.be.true();
          imprisionedMember.getChildren().filter(child => child !== replacement).forEach((child) => {
            expect(replacement.hasChildNode(child)).to.be.true();
          });

          expect(organization.activeMembers.findNodeById('31cd3865ef3f404b944ebd2d15f8c998')).to.be.undefined();
        });
      });

      describe('(Imprision main boss)', () => {

        it('should change the root of the organization to the most olders root child', () => {
          const membersList = [{
            id: 'root',
            parent: null,
            children: ['subordinate1', 'subordinate2']
          }, {
            id: 'subordinate1',
            startedAt: '1986-05-05T14:48:00.000Z',
            parent: 'root',
            children: []
          }, {
            id: 'subordinate2',
            startedAt: '1984-05-05T14:48:00.000Z',
            parent: 'root',
            children: []
          }];
          const organization = new Organization(membersList);
          const imprisionedMember = organization.imprision('root');
          expect(imprisionedMember.flatten()).to.equal({
            id: 'root',
            jail: true,
            parent: null,
            children: ['subordinate2', 'subordinate1']
          });
          expect(organization.getMainBoss().flatten()).to.equal({
            id: 'subordinate2',
            startedAt: '1984-05-05T14:48:00.000Z',
            parent: null,
            children: ['subordinate1']
          });
        });
      });

      describe('(Errors)', () => {

        it('should throw an error when trying to imprision a non existing member', () => {

          const organization = new Organization([{
            id: 'f653e12680054da7981684a23900632a',
            name: 'Pablo',
            surname: 'Escobar',
            role: 'boss',
            organization: 'Cartel de Medellin',
            startedAt: '1985-05-05T14:48:00.000Z',
            jail: false,
            children: [],
            parent: null
          }]);

          expect(() => organization.imprision('non-existing')).to.throw(Error, 'Can not imprision a non existing member: non-existing');
        });
      });
    });

    describe('(Release)', () => {

      describe('(Release a member that have equals)', () => {

        it('should allow to release a member and recover its old position within the organization', () => {

          const membersList = [
            {
              id: 'a',
              jail: false,
              parent: null,
              children: ['c']
            },
            {
              id: 'b',
              jail: true,
              parent: 'a',
              children: ['d']
            },
            {
              id: 'c',
              jail: false,
              parent: 'a',
              children: ['e', 'd']
            },
            {
              id: 'd',
              jail: false,
              parent: 'c',
              children: []
            },
            {
              id: 'e',
              jail: false,
              parent: 'c',
              children: []
            }
          ];

          const organization = new Organization(membersList);
          const releasedMember = organization.release('b');
          expect(organization.activeMembers.hasChildNode(releasedMember)).to.be.true();
          releasedMember.getChildren().forEach((children) => {
            expect(children.getParent()).to.equal(releasedMember);
          });
        });
      });

      describe('(Release a member that does not have any equal)', () => {

        it('should allow to release a member and recover its old position within the organization', () => {

          const membersList = [
            {
              id: 'a',
              jail: false,
              parent: null,
              children: ['c']
            },
            {
              id: 'b',
              jail: true,
              parent: 'a',
              children: ['c', 'd']
            },
            {
              id: 'c',
              jail: false,
              parent: 'a',
              children: ['d']
            },
            {
              id: 'd',
              jail: false,
              parent: 'c',
              children: []
            }
          ];

          const organization = new Organization(membersList);
          const releasedMember = organization.release('b');
          expect(organization.activeMembers.hasChildNode(releasedMember)).to.be.true();
          releasedMember.getChildren().forEach((children) => {
            expect(children.getParent()).to.equal(releasedMember);
          });
        });
      });

      describe('(Release a member that has a child imprisioned)', () => {

        it('should remove the child improsioned of its own list of childs', () => {
          const membersList = [
            {
              name: 'Gonzalo',
              surname: 'Rodríguez Gacha',
              role: 'underboss',
              organization: 'Cartel de Medellin',
              startedAt: '1985-06-05T14:48:00.000Z',
              jail: true,
              children: [
                '588975829e084764b66046b0ee7c814e',
                '2704f4f46c034eec869443d63250cb18'
              ],
              parent: 'f653e12680054da7981684a23900632a',
              id: 'c48ac60af8184d4f898230f41b77584e'
            },
            {
              name: 'Guillermo',
              surname: 'Sosa',
              role: 'soldier',
              organization: 'Cartel de Medellin',
              startedAt: '1988-06-05T14:48:00.000Z',
              jail: true,
              children: [],
              parent: '03061d6e58bc4c5dba66347885d3edd9',
              id: '2704f4f46c034eec869443d63250cb18'
            },
            {
              name: 'Pablo',
              surname: 'Escobar',
              role: 'boss',
              organization: 'Cartel de Medellin',
              startedAt: '1985-05-05T14:48:00.000Z',
              jail: false,
              children: [
                '03061d6e58bc4c5dba66347885d3edd9',
                '476fc73d2d844b6faa010e73b32d4ca4'
              ],
              parent: null,
              id: 'f653e12680054da7981684a23900632a'
            },
            {
              name: 'Carlos',
              surname: 'Lehder',
              role: 'underboss',
              organization: 'Cartel de Medellin',
              startedAt: '1985-06-03T14:48:00.000Z',
              jail: false,
              children: [
                'ec7a4f5f4c844b1abea8748c4eb7c21c',
                '588975829e084764b66046b0ee7c814e'
              ],
              parent: 'f653e12680054da7981684a23900632a',
              id: '03061d6e58bc4c5dba66347885d3edd9'
            },
            {
              name: 'Brances',
              surname: 'Muñoz',
              role: 'soldier',
              organization: 'Cartel de Medellin',
              startedAt: '1985-11-05T14:48:00.000Z',
              jail: false,
              children: [],
              parent: '03061d6e58bc4c5dba66347885d3edd9',
              id: 'ec7a4f5f4c844b1abea8748c4eb7c21c'
            },
            {
              name: 'Mario',
              surname: 'Castaño',
              role: 'soldier',
              organization: 'Cartel de Medellin',
              startedAt: '1986-06-05T14:48:00.000Z',
              jail: false,
              children: [],
              parent: '03061d6e58bc4c5dba66347885d3edd9',
              id: '588975829e084764b66046b0ee7c814e'
            },
            {
              name: 'Gustavo',
              surname: 'Gaviria',
              role: 'underboss',
              organization: 'Cartel de Medellin',
              startedAt: '1985-09-05T14:48:00.000Z',
              jail: false,
              children: [
                'ffd94b6dbfd84e339a14df88e14f66a5'
              ],
              parent: 'f653e12680054da7981684a23900632a',
              id: '476fc73d2d844b6faa010e73b32d4ca4'
            },
            {
              name: 'Brances',
              surname: 'Muñoz',
              role: 'soldier',
              organization: 'Cartel de Medellin',
              startedAt: '1989-02-05T14:48:00.000Z',
              jail: false,
              children: [],
              parent: '476fc73d2d844b6faa010e73b32d4ca4',
              id: 'ffd94b6dbfd84e339a14df88e14f66a5'
            }
          ];

          const organization = new Organization(membersList);
          const releasedMember = organization.release('c48ac60af8184d4f898230f41b77584e');
          expect(releasedMember.flatten()).to.equal({
            name: 'Gonzalo',
            surname: 'Rodríguez Gacha',
            role: 'underboss',
            organization: 'Cartel de Medellin',
            startedAt: '1985-06-05T14:48:00.000Z',
            jail: false,
            children: [
              '588975829e084764b66046b0ee7c814e'
            ],
            parent: 'f653e12680054da7981684a23900632a',
            id: 'c48ac60af8184d4f898230f41b77584e'
          });
          expect(releasedMember.getParent().flatten()).to.equal({
            name: 'Pablo',
            surname: 'Escobar',
            role: 'boss',
            organization: 'Cartel de Medellin',
            startedAt: '1985-05-05T14:48:00.000Z',
            jail: false,
            children: [
              '03061d6e58bc4c5dba66347885d3edd9',
              '476fc73d2d844b6faa010e73b32d4ca4',
              'c48ac60af8184d4f898230f41b77584e'
            ],
            parent: null,
            id: 'f653e12680054da7981684a23900632a'
          });
          expect(releasedMember.getChildren()[0].flatten()).to.equal({
            name: 'Mario',
            surname: 'Castaño',
            role: 'soldier',
            organization: 'Cartel de Medellin',
            startedAt: '1986-06-05T14:48:00.000Z',
            jail: false,
            children: [],
            parent: 'c48ac60af8184d4f898230f41b77584e',
            id: '588975829e084764b66046b0ee7c814e'
          });
        });
      });

      describe('(Release a member that has its parent imprisioned)', () => {

        it('should change the parent to the non jailed nearest boss of its parent', () => {
          const members = [
            {
              id: 'a',
              jail: false,
              parent: null,
              children: ['c']
            },
            {
              id: 'b',
              jail: true,
              parent: 'a',
              children: ['d']
            },
            {
              id: 'c',
              jail: false,
              parent: 'a',
              children: ['e']
            },
            {
              id: 'd',
              jail: true,
              parent: 'b',
              children: []
            },
            {
              id: 'e',
              jail: false,
              parent: 'c',
              children: []
            }
          ];

          const organization = new Organization(members);
          const releasedMember = organization.release('d');
          expect(releasedMember.getParent().flatten()).to.equal({
            id: 'a',
            jail: false,
            parent: null,
            children: ['c', 'd']
          });
        });
      });

      describe('(Release a previous imprisioned main boss)', () => {

        it('should recover the main boss position', () => {
          const membersList = [
            {
              id: 'root',
              jail: true,
              children: [
                'subordinate2',
                'subordinate1'
              ],
              parent: null
            },
            {
              id: 'subordinate2',
              startedAt: '1984-05-05T14:48:00.000Z',
              children: [
                'subordinate1'
              ],
              parent: null
            },
            {
              id: 'subordinate1',
              startedAt: '1986-05-05T14:48:00.000Z',
              children: [],
              parent: 'subordinate2'
            }
          ];

          const organization = new Organization(membersList);
          const releasedMember = organization.release('root');
          expect(organization.getMainBoss().flatten()).to.equal({
            id: 'root',
            jail: false,
            children: [
              'subordinate2',
              'subordinate1'
            ],
            parent: null
          });
          expect(organization.getMainBoss().getChildren()).to.have.length(2);
          expect(organization.getMainBoss().getChildren().map(c => c.flatten())).to.only.include([{
            id: 'subordinate2',
            startedAt: '1984-05-05T14:48:00.000Z',
            children: [],
            parent: 'root'
          },
          {
            id: 'subordinate1',
            startedAt: '1986-05-05T14:48:00.000Z',
            children: [],
            parent: 'root'
          }]);
        });
      });

      describe('(Errors)', () => {

        it('should throw an error when trying to release a non imprisioned member', () => {

          const organization = new Organization([{
            id: 'f653e12680054da7981684a23900632a',
            name: 'Pablo',
            surname: 'Escobar',
            role: 'boss',
            organization: 'Cartel de Medellin',
            startedAt: '1985-05-05T14:48:00.000Z',
            jail: false,
            children: [],
            parent: null
          }]);

          expect(() => organization.release('non-existing')).to.throw(Error, 'Can not release a non imprisioned member: non-existing');
        });
      });
    });

    describe('(Mappers)', () => {

      const organizationList = [
        {
          id: 'a',
          jail: false,
          children: [
            'b'
          ],
          parent: null
        },
        {
          id: 'b',

          jail: false,
          children: [],
          parent: 'a'
        },
        {
          id: 'c',
          jail: true,
          children: [],
          parent: 'a'
        }
      ];

      it('should map an organization tree to a list', () => {
        const organization = new Organization(organizationList);
        expect(organization.getOrganizationList()).to.only.include(organizationList);
      });
    });
  });
});

