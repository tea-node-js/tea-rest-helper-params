const delegate = require('func-delegate');
const _ = require('lodash');

module.exports = (rest) => {
  // 去掉参数中的某些key
  const omit = keys => (
    async (ctx, next) => {
      if (ctx.params) {
        ctx.params = _.omit(ctx.params, keys);
      }
      await next();
    }
  );

  // 检测必要参数
  const required = (keys, error) => (
    async (ctx, next) => {
      const missings = _.filter(keys, key => !_.has(ctx.params, key));
      if (missings.length) {
        const defaultError = error || Error(`Missing required params: ${missings}`);
        ctx.res.missingParameter({
          error: {
            errors: [{
              package: 'tea-rest-helper-params',
              method: 'required',
              message: defaultError.message || defaultError.stack,
            }],
          },
          message: defaultError.message || defaultError.stack,
        });
      } else {
        await next();
      }
    }
  );

  // 将 params 的可以做一个简单的映射
  const map = dict => (
    async (ctx, next) => {
      _.each(dict, (v, k) => {
        ctx.params[v] = ctx.params[k];
      });
      await next();
    }
  );

  // 给params赋值
  const assign = (keyPath, obj) => (
    async (ctx, next) => {
      const value = obj.fixed ? obj.fixed : _.get(ctx, obj.path);
      _.set(ctx.params, keyPath, value);
      await next();
    }
  );

  const omitSchemas = [{
    name: 'keys',
    type: Array,
    allowNull: false,
    validate: {
      check(keys) {
        _.each(keys, (v) => {
          if (!_.isString(v)) {
            throw Error('Every item in keys must be a string.');
          }
        });
        return true;
      },
    },
    message: 'Keys is an array and item must be a string.',
  }];

  const mapSchemas = [{
    name: 'dict',
    type: Object,
    allowNull: false,
    validate: {
      check(dict) {
        _.each(dict, (v) => {
          if (!_.isString(v)) {
            throw Error('Map dict value must be a string.');
          }
        });
        return true;
      },
    },
    message: 'Dict is an object, like this key => value, value is string.',
  }];

  const requiredSchemas = [{
    name: 'keys',
    type: Array,
    allowNull: false,
    validate: {
      check(keys) {
        _.each(keys, (v) => {
          if (!_.isString(v)) {
            throw Error('Every item in keys must be a string.');
          }
        });
        return true;
      },
    },
    message: 'Keys is an array and item must be a string.',
  }, {
    name: 'error',
    type: Error,
    allowNull: true,
    message: 'The error is called next when params missed.',
  }];

  const assignSchemas = [{
    name: 'keyPath',
    type: String,
    allowNull: false,
    defaultValue: 'params.id',
    message: 'Gets the value at path of object.',
  }, {
    name: 'obj',
    type: Object,
    allowNull: false,
    validate: {
      check(v) {
        if (!_.has(v, 'fixed') && !_.has(v, 'path')) {
          throw Error('Argument obj contains at least fixed, path one of them.');
        }
        return true;
      },
    },
    message: 'Fixed value or path of req object',
  }];

  rest.helper.params = {
    omit: delegate(omit, omitSchemas),
    map: delegate(map, mapSchemas),
    required: delegate(required, requiredSchemas),
    assign: delegate(assign, assignSchemas),
  };

  return rest.helper.params;
};
