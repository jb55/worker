
# worker

  Web worker API wrapper.

## Installation

    $ component install component/worker

## API

### Worker(script)

  Initialize a worker with the given `script`. This can also be a function
  without access to the surrounding scope.

### Worker#send(msg)

  Send a message to the worker.

```js
var upper = new Worker(function(){
  onmessage = function(e) {
    setTimeout(function(){
      postMessage({ id: e.data.id, string: e.data.string.toUpperCase() });
    }, 500);
  }
});

upper.on('message', function(msg){
  console.log(msg.string);
});

upper.send({ string: 'hello' });
upper.send({ string: 'world' });
```

### Worker#send(msg, callback[, transferables])

  Send a request message to the worker with the given `callback`. When
  using the request/response paradigm you should pass the `e.data.id` property
  back with your response so that the correct callback may be invoked:

```js
upper.send({ string: 'hello' }, function(msg){
  console.log(msg.string);
});
```

### Worker#close()

  Terminate the worker.

## License

  MIT
