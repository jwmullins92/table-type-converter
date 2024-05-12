const { regionId, combine_make, snout } = {
  combine_make: 10,
  regionId: 1,
  snout:
};

const questionFilterBuilder = {
  region: regionId
    ? `(regionId IS NULL OR regionId = ${regionId})`
    : `regionId IS NULL`,
  snount: snout
    ? ` AND (snoutsId is null OR snountsId = snout)`
    : ` AND snoutsId is null`,
};

console.log(
  Object.entries(questionFilterBuilder)
    .map(([, v]) => v)
    .join(``),
);
