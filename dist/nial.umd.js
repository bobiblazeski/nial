(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.N = {}));
}(this, function (exports) { 'use strict';

	const til = n => Array(n).fill(undefined).map((_, i) => i);

	const clone = x => JSON.parse(JSON.stringify(x));

	const arrayEquals = (a, b) => {
		return a.length === b.length && a.every((value, index) => {
			return value == b[index];
		});
	};

	const shape = (arr) => {
		if (!Array.isArray(arr)) {
			return [];
		}
		const dim = arr.reduce((result, current) => {
			return arrayEquals(result, shape(current)) ? result : false;
		}, shape(arr[0]));
		if (dim) {
			return [arr.length].concat(dim);
		}
		throw `Different sizes`;
	};

	const broadcastable = (ms_, ns_) => {
		const ms = ms_.slice(0).reverse();
		const ns = ns_.slice(0).reverse();
		for (const i of til(Math.min(ms.length, ns.length))) {
			if ((ms[i] !== ns[i]) && Math.min(ms[i], ns[i]) > 1)  {
				return false;
			}
		}
		return true;
	};

	const maxLen = (ms, ns) => Math.max(ms.length, ns.length);

	const accessor = (shape, ids_) => {
		const ids = ids_.slice(ids_.length - shape.length);
		return shape.reduce((r, d, i) =>
			r.concat(`[${d === 1 ? 0 : ids[i]}]`), []).join('');
	}; 

	const createOps = (op, ms, ns) => {
		const ids = ['i', 'j', 'k'].slice(0, maxLen(ms, ns));
		return `(m, n, ${ids.join(', ')}) =>  
		m${accessor(ms, ids)} ${op} n${accessor(ns, ids)}`;
	};

	const dimensions = (ms_, ns_) => {
		const ms = ms_.slice(0).reverse();
		const ns = ns_.slice(0).reverse(); 
		return til(maxLen(ms, ns)).map((i) => {
			return ms[i] && ns[i] ? Math.max(ms[i], ns[i]) : ms[i] || ns[i];  
		}).reverse();
	};

	const tensor1D = (ops, m, n, ms, ns) => {
		const dims = dimensions(ms, ns);
		return Array.from({length: dims[0]}, 
			(_, i) => ops(m, n, i));
	};

	const tensor2D = (ops, m, n, ms, ns) => {
		const dims = dimensions(ms, ns);
		return Array.from({length: dims[0]},
			(_, i) => Array.from({length: dims[1]}, 
				(_, j) => ops(m, n, i, j)));
	};

	const tensor3D = (ops, m, n, ms, ns) => {
		const dims = dimensions(ms, ns);
		return Array.from({length: dims[0]},
			(_, i) => Array.from({length: dims[1]}, 
				(_, j) => Array.from({length: dims[2]}, 
					(_, k) => ops(m, n, i, j, k))));
	};

	const broadcastOP = (op) => (m, n) => {
		const ms = shape(m);
		const ns = shape(n);
		if (!broadcastable(ms, ns)) throw `Unable to broadcats ${m} & ${n}`;

		const ops = eval(createOps(op, ms, ns));
		switch (maxLen(ms, ns)) {
			case 0:
				return ops(m, n);
			case 1:
				return tensor1D(ops, m, n, ms, ns);
			case 2:
				return tensor2D(ops, m, n, ms, ns);
			case 3:
				return tensor3D(ops, m, n, ms, ns);
			default:
				throw `Dimensions must be between [0-3] m: ${mShape}, n:${nShape}`;
		}
	};

	// https://d3js.org/d3-random/ v1.1.2 Copyright 2018 Mike Bostock
	  function defaultSource() {
	    return Math.random();
	  }
	  
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

	const createBuilder = op => dims => {
	  switch (dims.length) {
			case 0:
				return op();
			case 1:
				return Array.from({length: dims[0]}, 
					()=> op());
			case 2:
				return Array.from({length: dims[0]},
					() => Array.from({length: dims[1]}, 
						() => op()));
			case 3:
				return Array.from({length: dims[0]},
					() => Array.from({length: dims[1]}, 
						() => Array.from({length: dims[2]}, 
							() => op())));
			default:
				throw `Unsupported shape ${dims}`; 
		}
	};

	const zeros = createBuilder(() => 0);
	const ones = createBuilder(() => 1);
	const randomUniform = createBuilder(Math.random);
	const randn = createBuilder(Normal(0, 1));

	const dotVector = (a, b) => {
		let n = 0, lim = Math.min(a.length,b.length);
		for (var i = 0; i < lim; i++) n += a[i] * b[i];
		return n;
	};

	const dot = (a, b) => {
		const asl = shape(a).length;
		const bsl = shape(b).length;
		if (asl === 1 && bsl === 1) {
			return dotVector(a, b);
		} else if(asl === 2 && bsl === 1) {
			return a.map((d) => dotVector(d, b));
		}
		throw `Unsupported inputs ${a} ${b}`;
	};

	const max = m => m.reduce((r, d) => Math.max(r, d));
	const sqrt = m => m.reduce((r, d) => Math.sqrt(r, d));

	const clip = (a, min=-Infinity, max=+Infinity) => {
		if (shape(a).length !== 1) throw `Not implemented for ${a}`;
		return a.map((d) => Math.max(Math.min(d, max), min));
	};

	const variance = (a)  => { 
		if (shape(a).length !== 1) throw `Not implemented for ${a}`;
		const mean = a.reduce((r, d) => r + d) / a.length;
		return a.reduce((r, d) => r + Math.pow((d-mean), 2), 0) / a.length;
	};

	const add = broadcastOP('+');
	const sub = broadcastOP('-');
	const mul = broadcastOP('*');
	const div = broadcastOP('/');

	exports.add = add;
	exports.sub = sub;
	exports.mul = mul;
	exports.div = div;
	exports.clip = clip;
	exports.clone = clone;
	exports.dot = dot;
	exports.til = til;
	exports.max = max;
	exports.ones = ones;
	exports.randn = randn;
	exports.randomUniform = randomUniform;
	exports.shape = shape;
	exports.sqrt = sqrt;
	exports.variance = variance;
	exports.zeros = zeros;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
