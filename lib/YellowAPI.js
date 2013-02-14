/**
 * Copyright 2012 Yellow Pages Group, Inc.
 * Copyright 2012 Samuel Dionne <samuel.dionne@dinoz.mobi>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var http = require('http')
  , querystring = require('querystring')
  , URL = require('url');


/**
 * Initialize the YellowAPI Application, providing access to the Yellow Pages Group API.
 *
 * The configuration:
 * - apiKey: the application private kay
 * - uid: unique identifier for the application
 * - lang: (optional) the language used by the application (can be 'en' or 'fr')
 * - useSandbox: (optional) specify if the sandbox environment should be used
 *
 * @param {Object} config the application configuration
 */
var YellowAPI = exports.yellowapi = exports.YellowAPI = function(config) {
  var yellowapi;

  if (this instanceof YellowAPI) {
    // instantiation using the 'new' operator
    yellowapi = this;
  } else {
    yellowapi = new YellowAPI(config);
  }

  for (var i in config) {
    yellowapi[i] = config[i];
  }

  return yellowapi;
};

YellowAPI.prototype = {
  // The API Key.
  apiKey: null,

  // The unique identifier for the application
  uid: null,

  // The language of the application (default to english)
  lang: 'en',

  // Environment to use (default to prod)
  useSandbox: false,

  // Milliseconds for transmission of data from YellowAPI to complete
  timeout: 60000,

  // Map of aliases to YellowAPI domains
  DOMAIN_MAP: {
    prod   : 'http://api.yellowapi.com/',
    sandbox: 'http://api.sandbox.yellowapi.com/',
  },

  /**
	 * Do reverse search
	 *
	 * @param {String} phone the phone number
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error message
	 */
  findBusinessByPhone: function(phone, success, error) {
    this.findBusiness(phone, 'canada', 1, 40, '', success, error);
  },

  /**
   * Do a what where search using provided information
	 *
	 * The filter type can be on or many of these choice separated by a hyphen:
	 * - rr (for business having reviews)
	 * - fto (for business having photos)
 	 * - vdo (for business having videos)
	 *
	 * @param {String} what is searched
	 * @param {double} latitude the latitude from where the results should be from
	 * @param {double} longitude the longitude from where the results should be from
	 * @param {int page the page number
	 * @param {int} pageLength the  number of results per page
	 * @param {String} filter the filter type
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error message
	 */
  findBusinessNear: function(what, latitude, longitude, page, pageLength, filter, success, error) {
    this.findBusiness(phone, 'cZ' + longitude + ',' + latitude, page, pageLength, filter, success, error);
  },

  /**
	 * Do a what where search using provided information
	 *
	 * The filter type can be on or many of these choice separated by a hyphen:
	 * - rr (for business having reviews)
	 * - fto (for business having photos)
 	 * - vdo (for business having videos)
	 *
	 * @param {String} what is searched
	 * @param {String} where the results should be from
	 * @param {int page the page number
	 * @param {int} pageLength the  number of results per page
	 * @param {String} filter the filter type
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error message
	 */
  findBusiness: function(what, where, page, pageLength, filter, success, error) {
    var params = {
            what: what
          , where: where
          , pg: page
          , pgLen: pageLength
          , sflag: filter
          , apiKey: this.apiKey
          , UID: this.uid
          , lang: this.lang
          , fmt: 'JSON'
        }
      , url = this._getUrl('FindBusiness/', params);

    this._makeRequest(url, success, error);
  },

  /**
	 * Get detailed information about a business
	 *
	 * @param {String} prov the province code of the merchant
	 * @param {String} city the city name of the merchant
	 * @param {String} name the name of the merchant
	 * @param {String} id the merchant id got from a search result
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error message
	 */
  getBusinessDetails: function(prov, city, name, id, success, error) {
    var params = {
            prov: prov.replace(/[^a-z0-9]+/i, '-')
          , city: city.replace(/[^a-z0-9]+/i, '-')
          , 'bus-name': name.replace(/[^a-z0-9]+/i, '-')
          , listingId: id
          , apiKey: this.apiKey
          , UID: this.uid
          , lang: this.lang
          , fmt: 'JSON'
        }
      , url = this._getUrl('GetBusinessDetails/', params);

    this._makeRequest(url, success, error);
  },

  /**
	 * Get merchant related to the parent specified
	 * (e.g. Dominos pizza's branches)
	 *
	 * @param {String} parentId the id of the parent merchant
	 * @param {int} page the page number
	 * @param {int} pageLength the number of result per page
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error object
	 */
  findDealers: function(parentId, page, pageLength, success, error) {
    var params = {
            pid: parentId
          , pg: page
          , pgLen: pageLength
          , listingId: id
          , apiKey: this.apiKey
          , UID: this.uid
          , lang: this.lang
          , fmt: 'JSON'
        }
      , url = this._getUrl('FindDealer/', params);

    this._makeRequest(url, success, error);
  },

  /**
   * Build the URL for configured environment, method and parameters.
   *
   * @param {String} method the YellowAPI method name
   * @param {Object} params optional query parameters
   * @return {String} the URL for the given parameters
   */
  _getUrl: function(method, params) {
    var url = this.DOMAIN_MAP[this.useSandbox ? 'sandbox' : 'prod'];

    if (method[0] === '/') {
      method = method.substr(1);
    }

    url += method;

    if (params) {
      url += '?' + querystring.stringify(params);
    }

    return url;
  },

  /**
   * Makes an HTTP request. This method can be overriden by subclasses if
   * developers want to do fancier things or use something other than http to
   * make the request.
   *
   * @param {String} url the URL to make the request to
   * @param {Function( json )} success callback to send the JSON response
   * @param {Function{ String }} error callback to send an error object
   */
  _makeRequest: function(url, success, error) {
    var parts = URL.parse(url);

    var options = {
      host: parts.hostname
    , port: parts.port ? parts.port : 80
    , path: parts.path
    };

    var request = http.get(options, function(result) {
      result.setEncoding('utf8');

      var body = '';

      result.on('data', function(chunk) {
        body += chunk;
      });

      result.on('end', function() {
        clearTimeout(timeout);

        try {
          success && success(JSON.parse(body));
        } catch (err) {
          error && error(err);
        }
      });
    });

    request.on('error', function(e) {
      error && error(e);
    });

    var timeout = setTimeout(function() {
      request.abort();

      error && error('timeout');
    }, this.timeout);
  },

};
