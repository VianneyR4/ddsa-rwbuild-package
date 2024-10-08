// some shared code for dealing with paths

// matchingHeads([], []) === true
// matchingHeads([1], []) === true
// matchingHeads([], [1]) === true
// matchingHeads([1], [2]) === false
// matchingHeads([1], [1]) === true
// matchingHeads([1,2], [1,2]) === true
// matchingHeads([1,2], [1,2,3]) === true
// matchingHeads([1,2,3], [1,2]) === true
// matchingHeads([1,2], [1,3]) === false
export const matchingHeads = (a, b) =>
  Array.isArray(a) && Array.isArray(b)
    ? a.length > 0 && b.length > 0
      ? a[0] === b[0]
        ? matchingHeads(a.slice(1), b.slice(1))
        : false
      : true
    : false
