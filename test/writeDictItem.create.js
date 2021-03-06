'use strict';

/* eslint-env mocha */

const nock = require('nock');
const expect = require('expect');
const config = require('../src/config');
const fastlyPromises = require('../src/index');
const response = require('./response/dictitem.response');

describe('#writeDictItem.create', () => {
  const fastly = fastlyPromises('923b6bd5266a7f932e41962755bd4254', 'SU1Z0isxPaozGVKXdv0eY');
  let res;

  nock(config.mainEntryPoint)
    // get the dictionary first
    .get('/service/SU1Z0isxPaozGVKXdv0eY/version/1/dictionary/my_dictionary')
    .reply(200, response.dict.get)
    // then get the dict item
    .get('/service/SU1Z0isxPaozGVKXdv0eY/dictionary/5clCytcTJrnvPi8wjqPH0q/item/some_key')
    .reply(404, response.item.missing)
    // get the dictionary again
    .get('/service/SU1Z0isxPaozGVKXdv0eY/version/1/dictionary/my_dictionary')
    .reply(200, response.dict.get)
    // get the dictionary again
    .get('/service/SU1Z0isxPaozGVKXdv0eY/version/1/dictionary/my_dictionary')
    .reply(200, response.dict.get)
    .post('/service/SU1Z0isxPaozGVKXdv0eY/dictionary/5clCytcTJrnvPi8wjqPH0q/item')
    .reply(200, response.item.post);
  before(async () => {
    res = await fastly.writeDictItem(1, 'my_dictionary', 'some_key', 'some_value');
  });

  it('response should be a status 200', () => {
    expect(res.status).toBe(200);
  });

  it('response body should exist', () => {
    expect(res.data).toBeTruthy();
  });

  it('response body should be an object', () => {
    expect(typeof res.data).toBe('object');
  });

  it('response body should contain all properties', () => {
    ['dictionary_id',
      'service_id',
      'item_key',
      'item_value',
      'created_at',
      'deleted_at',
      'updated_at'].forEach((e) => {
      expect(Object.keys(res.data)).toContain(e);
    });
  });
});
