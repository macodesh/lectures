const sum = async (x, y) => x + y;

const numbers = [1, 2, 3, 5, 8, 13, 21, 34];

Promise.all(numbers.map(async (num) => sum(num, 3))).then((result) => {
  console.log('Ex. 1', result);
});

Promise.all([sum(1, 2), sum(3, 5)]).then((result) => {
  console.log('Ex. 2', result);
});

const result = numbers.map(async (num) => sum(num, 3));

result[0].then((promise0) => {
  console.log('Ex. 3', promise0);
});
