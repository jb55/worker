
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var workerify = require('workerify');
var WebWorker = window.Worker;

/**
 * Expose `Worker`.
 */

module.exports = Worker;

/**
 * Return a Worker given a script string or a function
 *
 * @param {String|Function} script
 * @api private
 */
function parse(script) {
  if (typeof script !== 'function') return new WebWorker(script);
  return workerify(script);
}

/**
 * Initialize a new `Worker` with `script`.
 *
 * @param {String|Function} script
 * @api public
 */

function Worker(script) {
  var self = this;
  this.ids = 0;
  this.script = script;
  this.worker = parse(script);
  this.worker.addEventListener('message', this.onmessage.bind(this));
  this.worker.addEventListener('error', this.onerror.bind(this));
}

/**
 * Mixin emitter.
 */

Emitter(Worker.prototype);

/**
 * Handle messages.
 */

Worker.prototype.onmessage = function(e){
  this.emit('message', e.data, e);
};

/**
 * Handle errors.
 */

Worker.prototype.onerror = function(e){
  var err = new Error(e.message);
  err.event = e;
  this.emit('error', err);
};

/**
 * Terminate the worker.
 */

Worker.prototype.close = function(){
  this.worker.terminate();
};

/**
 * Send a `msg` with optional callback `fn`.
 *
 * TODO: allow passing of transferrables
 *
 * @param {Mixed} msg
 * @param {Function} [fn]
 * @api public
 */

Worker.prototype.send = function(msg, fn){
  if (fn) this.request(msg, fn);
  this.worker.postMessage(msg);
};

/**
 * Send a `msg` as a request with `fn`.
 *
 * @param {Mixed} msg
 * @param {Function} fn
 * @param {Array} [transferables]
 * @api public
 */

Worker.prototype.request = function(msg, fn, transferables){
  var self = this;
  var id = ++this.ids;

  // req
  msg.id = id;
  this.worker.postMessage(msg, transferables);

  // rep
  this.on('message', onmessage);

  function onmessage(msg) {
    if (id != msg.id) return;
    self.off('message', onmessage);
    delete msg.id;
    fn(msg);
  }
};
