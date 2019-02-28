import {til, clone, shape} from './util';
import {broadcastOP} from './broadcast';
import {ones, randomUniform, randn, zeros} from './create';

const dotVector = (a, b) => {
	let n = 0, lim = Math.min(a.length,b.length);
	for (var i = 0; i < lim; i++) n += a[i] * b[i];
	return n;
}

const dot = (a, b) => {
	const asl = shape(a).length;
	const bsl = shape(b).length;
	if (asl === 1 && bsl === 1) {
		return dotVector(a, b);
	} else if(asl === 2 && bsl === 1) {
		return a.map((d) => dotVector(d, b));
	}
	throw `Unsupported inputs ${a} ${b}`;
}

const max = m => m.reduce((r, d) => Math.max(r, d));
const sqrt = m => m.reduce((r, d) => Math.sqrt(r, d));

const clip = (a, min=-Infinity, max=+Infinity) => {
	if (shape(a).length !== 1) throw `Not implemented for ${a}`;
	return a.map((d) => Math.max(Math.min(d, max), min));
}

const variance = (a)  => { 
	if (shape(a).length !== 1) throw `Not implemented for ${a}`;
	const mean = a.reduce((r, d) => r + d) / a.length;
	return a.reduce((r, d) => r + Math.pow((d-mean), 2), 0) / a.length;
}

const add = broadcastOP('+');
const sub = broadcastOP('-');
const mul = broadcastOP('*');
const div = broadcastOP('/');

export  {
	add,
	sub,
	mul,
	div,
	clip,
	clone,
	dot,
	til,
	max,
	ones,
	randn,
	randomUniform,
	shape,
	sqrt,
	variance,
	zeros,
};


