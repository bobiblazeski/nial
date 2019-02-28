import {til, shape} from './util';

const broadcastable = (ms_, ns_) => {
	const ms = ms_.slice(0).reverse();
	const ns = ns_.slice(0).reverse();
	for (const i of til(Math.min(ms.length, ns.length))) {
		if ((ms[i] !== ns[i]) && Math.min(ms[i], ns[i]) > 1)  {
			return false;
		}
	}
	return true;
}

const maxLen = (ms, ns) => Math.max(ms.length, ns.length);

const accessor = (shape, ids_) => {
	const ids = ids_.slice(ids_.length - shape.length);
	return shape.reduce((r, d, i) =>
		r.concat(`[${d === 1 ? 0 : ids[i]}]`), []).join('');
} 

const createOps = (op, ms, ns) => {
	const ids = ['i', 'j', 'k'].slice(0, maxLen(ms, ns));
	return `(m, n, ${ids.join(', ')}) =>  
		m${accessor(ms, ids)} ${op} n${accessor(ns, ids)}`;
}

const dimensions = (ms_, ns_) => {
	const ms = ms_.slice(0).reverse();
	const ns = ns_.slice(0).reverse(); 
	return til(maxLen(ms, ns)).map((i) => {
		return ms[i] && ns[i] ? Math.max(ms[i], ns[i]) : ms[i] || ns[i];  
	}).reverse();
}

const tensor1D = (ops, m, n, ms, ns) => {
	const dims = dimensions(ms, ns);
	return Array.from({length: dims[0]}, 
		(_, i) => ops(m, n, i));
}

const tensor2D = (ops, m, n, ms, ns) => {
	const dims = dimensions(ms, ns);
	return Array.from({length: dims[0]},
		(_, i) => Array.from({length: dims[1]}, 
			(_, j) => ops(m, n, i, j)));
}

const tensor3D = (ops, m, n, ms, ns) => {
	const dims = dimensions(ms, ns);
	return Array.from({length: dims[0]},
		(_, i) => Array.from({length: dims[1]}, 
			(_, j) => Array.from({length: dims[2]}, 
				(_, k) => ops(m, n, i, j, k))));
}

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

export {
  broadcastOP
};