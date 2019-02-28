// https://d3js.org/d3-random/ v1.1.2 Copyright 2018 Mike Bostock
  function defaultSource() {
    return Math.random();
  }
  
  var Uniform = (function sourceRandomUniform(source) {
    function randomUniform(min, max) {
      min = min == null ? 0 : +min;
      max = max == null ? 1 : +max;
      if (arguments.length === 1) max = min, min = 0;
      else max -= min;
      return function() {
        return source() * max + min;
      };
    }
  
    randomUniform.source = sourceRandomUniform;
  
    return randomUniform;
  })(defaultSource);
  
  var Normal = (function sourceRandomNormal(source) {
    function randomNormal(mu, sigma) {
      var x, r;
      mu = mu == null ? 0 : +mu;
      sigma = sigma == null ? 1 : +sigma;
      return function() {
        var y;
  
        // If available, use the second previously-generated uniform random.
        if (x != null) y = x, x = null;
  
        // Otherwise, generate a new x and y.
        else do {
          x = source() * 2 - 1;
          y = source() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
  
        return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r);
      };
    }
  
    randomNormal.source = sourceRandomNormal;
  
    return randomNormal;
  })(defaultSource);
  
  var LogNormal = (function sourceRandomLogNormal(source) {
    function randomLogNormal() {
      var randomNormal = normal.source(source).apply(this, arguments);
      return function() {
        return Math.exp(randomNormal());
      };
    }
  
    randomLogNormal.source = sourceRandomLogNormal;
  
    return randomLogNormal;
  })(defaultSource);
  
  var IrwinHall = (function sourceRandomIrwinHall(source) {
    function randomIrwinHall(n) {
      return function() {
        for (var sum = 0, i = 0; i < n; ++i) sum += source();
        return sum;
      };
    }
  
    randomIrwinHall.source = sourceRandomIrwinHall;
  
    return randomIrwinHall;
  })(defaultSource);
  
  var Bates = (function sourceRandomBates(source) {
    function randomBates(n) {
      var randomIrwinHall = irwinHall.source(source)(n);
      return function() {
        return randomIrwinHall() / n;
      };
    }
  
    randomBates.source = sourceRandomBates;
  
    return randomBates;
  })(defaultSource);
  
  var Exponential = (function sourceRandomExponential(source) {
    function randomExponential(lambda) {
      return function() {
        return -Math.log(1 - source()) / lambda;
      };
    }
  
    randomExponential.source = sourceRandomExponential;
  
    return randomExponential;
  })(defaultSource);
  
 export {
  Uniform,
  Normal,
  LogNormal,
  Bates,
  IrwinHall,
  Exponential,
 };