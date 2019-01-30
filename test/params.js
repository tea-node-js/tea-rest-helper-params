const assert = require('assert');
const rest = require('tea-rest');
const helper = require('../')(rest);

/* global describe it */
describe('open-rest-helper-params', () => {
  describe('omit', () => {
    it('keys type error', (done) => {
      assert.throws(() => {
        helper.omit({});
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Keys is an array and item must be a string.', err.message);
        done();
      });
    });

    it('keys item error', (done) => {
      assert.throws(() => {
        helper.omit([null, []]);
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Every item in keys must be a string.', err.message);
        done();
      });
    });


    it('omit 1', (done) => {
      const omit = helper.omit(['age']);
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
      };
      omit(ctx, () => {
        assert.deepEqual({ name: 'baiyu', edu: 'College' }, ctx.params);
        done();
      });
    });

    it('omit 2', (done) => {
      const omit = helper.omit(['age', 'edu']);
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
      };
      omit(ctx, () => {
        assert.deepEqual({ name: 'baiyu' }, ctx.params);
        done();
      });
    });

    it('omit params undefined', (done) => {
      const omit = helper.omit(['age', 'edu']);
      const ctx = {};
      omit(ctx, () => {
        assert.equal(undefined, ctx.params);
        done();
      });
    });
  });

  describe('required', () => {
    it('keys type error', (done) => {
      assert.throws(() => {
        helper.required({});
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Keys is an array and item must be a string.', err.message);
        done();
      });
    });

    it('keys item error', (done) => {
      assert.throws(() => {
        helper.required([null, []]);
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Every item in keys must be a string.', err.message);
        done();
      });
    });

    it('error type error', (done) => {
      assert.throws(() => {
        helper.required(['username', 'password'], {});
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('The error is called next when params missed.', err.message);
        done();
      });
    });

    it('error is null, check pass', (done) => {
      const required = helper.required(['age']);
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
      };
      required(ctx, () => {
        assert.equal(36, ctx.params.age);
        done();
      });
    });

    it('error is null, check dont pass', (done) => {
      const required = helper.required(['income']);
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
        res: {
          missingParameter: ({
            error = null, message = null,
          }) => {
            const { errors } = error;
            assert.deepEqual([{
              package: 'tea-rest-helper-params',
              method: 'required',
              message: 'Missing required params: income',
            }], errors);
            assert.equal('Missing required params: income', message);
            done();
          },
        },
      };
      required(ctx);
    });

    it('error isnt null, check pass', (done) => {
      const required = helper.required(['age'], Error('Hello world'));
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
      };
      required(ctx, () => {
        assert.equal(36, ctx.params.age);
        done();
      });
    });
    it('error isnt null, check dont pass', (done) => {
      const required = helper.required(['income'], Error('Hello world'));
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
        res: {
          missingParameter: ({
            error = null, message = null,
          }) => {
            const { errors } = error;
            assert.deepEqual([{
              package: 'tea-rest-helper-params',
              method: 'required',
              message: 'Hello world',
            }], errors);
            assert.equal('Hello world', message);
            done();
          },
        },
      };
      required(ctx);
    });

    it('error is null, check pass', (done) => {
      const required = helper.required(['id', 'user']);
      const ctx = {
        params: {
          id: 1,
          user: {
            id: 1,
            name: 'mage3k',
            age: 26,
          },
        },
      };
      required(ctx, () => {
        assert.deepEqual({
          id: 1,
          name: 'mage3k',
          age: 26,
        }, ctx.params.user);
        done();
      });
    });

    it('error is null, check pass', (done) => {
      const required = helper.required(['id', 'user.id']);
      const ctx = {
        params: {
          id: 1,
          user: {
            id: 1,
            name: 'mage3k',
            age: 26,
          },
        },
      };
      required(ctx, () => {
        assert.equal(1, ctx.params.user.id);
        done();
      });
    });

    it('error isnt null, check dont pass', (done) => {
      const required = helper.required(['income', 'user.id']);
      const ctx = {
        params: {
          id: 1,
          user: {
            id: 1,
            name: 'mage3k',
            age: 26,
          },
        },
        res: {
          missingParameter: ({
            error = null, message = null,
          }) => {
            const { errors } = error;
            assert.deepEqual([{
              package: 'tea-rest-helper-params',
              method: 'required',
              message: 'Missing required params: income',
            }], errors);
            assert.equal('Missing required params: income', message);
            done();
          },
        },

      };
      required(ctx);
    });
  });

  describe('map', () => {
    it('dict type error', (done) => {
      assert.throws(() => {
        helper.map('hello world');
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Dict is an object, like this key => value, value is string.', err.message);
        done();
      });
    });

    it('dict type error, include non-string', (done) => {
      assert.throws(() => {
        helper.map({ key: ['hello world'] });
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Map dict value must be a string.', err.message);
        done();
      });
    });

    it('params map', (done) => {
      const map = helper.map({ name: 'username' });
      const ctx = {
        params: {
          name: 'baiyu',
          age: 36,
          edu: 'College',
        },
      };
      map(ctx, () => {
        assert.deepEqual({
          name: 'baiyu',
          username: 'baiyu',
          age: 36,
          edu: 'College',
        }, ctx.params);
        done();
      });
    });
  });


  describe('assign', () => {
    it('keyPath type error', (done) => {
      assert.throws(() => {
        helper.assign(['hello world']);
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Gets the value at path of object.', err.message);
        done();
      });
    });

    it('obj type error', (done) => {
      assert.throws(() => {
        helper.assign('hooks.user.id', 'hello world');
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Fixed value or path of req object', err.message);
        done();
      });
    });

    it('obj validate error', (done) => {
      assert.throws(() => {
        helper.assign('hooks.user.id', { name: 'Stone' });
      }, (err) => {
        assert.ok(err instanceof Error);
        assert.equal('Argument obj contains at least fixed, path one of them.', err.message);
        done();
      });
    });


    it('assign fixed value', (done) => {
      const assign = helper.assign('user.id', { fixed: 100 });
      const ctx = {
        params: {},
      };
      assign(ctx, () => {
        assert.equal(100, ctx.params.user.id);
        done();
      });
    });

    it('assign path value', (done) => {
      const assign = helper.assign('user.id', { path: 'user.id' });
      const ctx = {
        params: {},
        user: {
          id: 100,
        },
      };
      assign(ctx, () => {
        assert.equal(100, ctx.params.user.id);
        done();
      });
    });
  });
});
