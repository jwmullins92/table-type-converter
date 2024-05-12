const typeMappings = {
  BOOLEAN: `boolean`,
  TEXT: `string`,
  VARCHAR: `string`,
  DECIMAL: `number`,
  INT: `number`,
  DATETIME: `Date`,
};

const getTypesFromTables = (
  tableStrings: Record<string, string>,
  extractShared = false,
) => {
  let types;
  const tables = Object.fromEntries(
    Object.entries(tableStrings).map(([k, v]) => [
      k,
      Object.fromEntries(
        v
          .replace(/\d,/g, "")
          .split(",")
          .map((col) => {
            const c = col
              .trim()
              .replace(/\((\d|,|\s)+\)/g, "")
              .replace(" ", ",")
              .replace(" ", ",")
              .split(",");
            return [
              `${c[0]}${c[2]?.includes("NOT NULL") ? `` : `?`}`,
              typeMappings[c[1] as keyof typeof typeMappings],
            ];
          }),
      ),
    ]),
  );
  types = tables;
  if (extractShared) {
    const commonTypes = Object.fromEntries(
      Object.values(tables)
        .map((t) => Object.entries(t))
        .reduce((intersection, currentArray) => {
          return intersection.filter(([k1, v1]) =>
            currentArray.some(([k2, v2]) => k1 === k2 && v1 === v2),
          );
        }),
    );
    const filteredTables = Object.fromEntries(
      Object.entries(tables).map(([k, v]) => [
        k,
        Object.fromEntries(
          Object.entries(v).filter(
            ([k, v]) => !Object.keys(commonTypes).includes(k),
          ),
        ),
      ]),
    );
    filteredTables.shared = commonTypes;
    types = filteredTables;
  }
  console.log(JSON.stringify(types, null, 2).replaceAll(/[",]/g, ``));
};

getTypesFromTables({
  headerModel: `              internalId INT NOT NULL,
    controlToShowId INT NOT NULL,
    parentControlToShowId INT NOT NULL,
    regionId INT NOT NULL,
    headTypeId INT NOT NULL,
    sensorTypeId INT NOT NULL,
    headerConnectorId INT NOT NULL,
    combineConnectorId INT NOT NULL,
    defaultHarnessChoiceId INT NOT NULL,
    name TEXT,
    headerWidthMin INT NOT NULL,
    headerWidthMax INT NOT NULL,
    sensorMin INT NOT NULL,
    sensorMax INT NOT NULL,
    headerYearMin INT NOT NULL,
    headerYearMax INT NOT NULL,
    checkedByDefault BOOLEAN`,
});
