import {Normal} from './random';

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
}

const zeros = createBuilder(() => 0);
const ones = createBuilder(() => 1);
const randomUniform = createBuilder(Math.random);
const randn = createBuilder(Normal(0, 1));

export {
  ones,
  randn,
  randomUniform,
  zeros,
};