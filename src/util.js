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
}

export { 
  til, 
  clone,
  shape
};