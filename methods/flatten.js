module.exports = function(data) {
  let flat = '';

  function *traverse(layer) {
    if (!layer) {
      return;
    }

    let items = [];

    if (typeof layer === 'object') {
      items = Object.values(layer);
    } else {
      yield layer;
      return;
    }

    for (let i = 0; i < items.length; i++) {
      yield* traverse(items[i]);
    }
  }

  const traverser = traverse(data);
  let result = traverser.next();

  while (!result.done) {
    flat = `${flat} ${result.value}`;
    result = traverser.next();
  }

  return flat;
};
