import { dbConnect, dbQuery } from "@precisionplanting/node-api/backend";
import { camelize } from "../lib/index.js";

dbConnect(`configurator`);

const cornQustion = async () => {
  const questionIdsList: number[] = [];

  const idTest = (await dbQuery(
    `
		SELECT cq.internalId 
		FROM configurator.CornQuestion cq
		JOIN configurator.CornQuestionCombineMake cqcm
			ON cq.internalId = cqcm.cornQuestionId AND cqcm.combineMakeId IN (0, 10)
		JOIN configurator.CornQuestionCombineModel cqcmdl
			ON cq.internalId = cqcmdl.cornQuestionId AND cqcmdl.combineModelId IN (0, 263)
		JOIN configurator.CornQuestionHeaderMake cqhm
			ON cq.internalId = cqhm.cornQuestionId AND cqhm.headerMakeId IN (0, 30)
		JOIN configurator.CornQuestionHeaderModel cqhmdl
			ON cq.internalId = cqhmdl.cornQuestionId AND cqhmdl.headerModelId IN (0)
		JOIN configurator.CornQuestionCombineConnector cqcc
			ON cq.internalId = cqcc.cornQuestionId AND cqcc.combineConnectorId IN (0, 22)
		WHERE cq.regionId IN (0) 
		AND cq.snoutsId IN (0) 
		AND cq.headerConnectorId IN (0) 
# 		AND numberOfRowsMin <= 3 
# 		AND numberOfRowsMax >= 3
# 		AND headerYearMin <= 0
# 		AND headerYearMax >= 0
# 		AND rowSpacingMin <= 0
# 		AND rowSpacingMax >= 0
# 		AND sensorMin <= 2
# 		AND sensorMax >= 2
	`,
  )) as { internalId: number }[];

  console.log(idTest.map(({ internalId }) => internalId));

  const questionsNotFilteredByQuestionId = (
    (await dbQuery(
      `
		SELECT internalId 
		FROM configurator.CornQuestion 
		WHERE regionId in (0) 
		AND snoutsId in (0) 
		AND headerConnectorId IN (0) 
# 		AND numberOfRowsMin <= 3 
# 		AND numberOfRowsMax >= 3
# 		AND headerYearMin <= 0
# 		AND headerYearMax >= 0
# 		AND rowSpacingMin <= 0
# 		AND rowSpacingMax >= 0
# 		AND sensorMin <= 2
# 		AND sensorMax >= 2
	`,
    )) as { internalId: number }[]
  ).map((id) => id.internalId);

  const questionCMakeRows = (await dbQuery(
    `
		SELECT cornQuestionId
		FROM configurator.CornQuestionCombineMake
		WHERE combineMakeId IN (0, 10)
	`,
  )) as { cornQuestionId: number }[];

  const cMakeQuestionIdsList = [];

  if (questionCMakeRows != null) {
    if (questionsNotFilteredByQuestionId.length > 0) {
      for (const row of questionCMakeRows) {
        if (questionsNotFilteredByQuestionId.includes(row.cornQuestionId)) {
          cMakeQuestionIdsList.push(row.cornQuestionId);
        }
      }
    }
  }

  const questionCModelRows = (await dbQuery(
    `
		SELECT cornQuestionId
		FROM configurator.CornQuestionCombineModel
		WHERE combineModelId IN (0, 263)
	`,
  )) as { cornQuestionId: number }[];

  const cMakeModelQuestionIdsList = [];

  if (questionCModelRows.length > 0) {
    for (const model of questionCModelRows) {
      if (cMakeQuestionIdsList.includes(model.cornQuestionId))
        cMakeModelQuestionIdsList.push(model.cornQuestionId);
    }
  }

  const hMakeQuestionIdsList = [];
  const hMakeModelQuestionIdsList = [];

  const questionHMakeRows = (await dbQuery(
    `
		SELECT * FROM configurator.CornQuestionHeaderMake
		WHERE headerMakeId in (0, 30)
	`,
  )) as { cornQuestionId: number }[];

  if (questionHMakeRows) {
    if (cMakeQuestionIdsList.length) {
      for (const row of questionHMakeRows) {
        if (cMakeModelQuestionIdsList.includes(row.cornQuestionId)) {
          hMakeQuestionIdsList.push(row.cornQuestionId);
        }
      }
    }
  }

  const questionHModelRows = (await dbQuery(
    `
		SELECT * FROM configurator.CornQuestionHeaderModel
		WHERE headerModelId IN (0)
	`,
  )) as { cornQuestionId: number }[];

  if (questionHModelRows && questionHModelRows.length) {
    for (const row of questionHModelRows) {
      if (hMakeQuestionIdsList.includes(row.cornQuestionId)) {
        hMakeModelQuestionIdsList.push(row.cornQuestionId);
      }
    }
  }

  const questionCConnRows = (await dbQuery(`
	SELECT * FROM configurator.CornQuestionCombineConnector
	WHERE combineConnectorId IN (0, 22)
`)) as { cornQuestionId: number }[];

  if (questionCConnRows.length) {
    for (const row of questionCConnRows) {
      if (hMakeModelQuestionIdsList.includes(row.cornQuestionId)) {
        questionIdsList.push(row.cornQuestionId);
      }
    }
  }

  console.log(questionIdsList);
};

const grainQuestion = async () => {
  const filteredQuery = (
    (await dbQuery(
      `
			SELECT gq.internalId
			FROM GrainQuestion gq
			JOIN GrainQuestionCombineMake gqcm
				ON gq.internalId = gqcm.grainQuestionId AND gqcm.combineMakeId IN (0, 10)
			JOIN GrainQuestionCombineModel gqcmdl 
			    ON gqcmdl.grainQuestionId = gq.internalId AND gqcmdl.combineModelId IN (0)
			JOIN GrainQuestionHeaderMake gqhm
				ON gq.internalId = gqhm.grainQuestionId AND gqhm.headerMakeId IN (0)
			JOIN GrainQuestionHeaderModel gqhmdl
				ON gq.internalId = gqhmdl.grainQuestionId AND gqhmdl.headerModelId IN (0)
			WHERE gq.regionId in (0) 
			AND gq.headerConnectorId IN (0)
			AND gq.combineConnectorId IN (0)
			AND gq.headTypeId IN (0)
			AND gq.sensorTypeId IN (0)
			AND gq.parentControlToShowId = 0
# 			AND gq.parentControlToShowId = 0
	# 		AND sensorMin <= 2
	# 		AND sensorMax >= 2
	# 		AND headerYearMin <= 1990
	# 		AND headerYearMax >= 1990
	# 		AND headerWidthMin <= 50
	# 		AND headerWidthMax >= 50
		`,
    )) as { internalId: number }[]
  ).map((id) => id.internalId);

  const results = (await dbQuery(`
		SELECT * FROM GrainQuestion
		WHERE internalId IN (0, ${filteredQuery.join(`, `)})
	`)) as {
    internalId: number;
    controlToShowId: number;
    parentControlToShowId: number;
    regionId: number;
    headTypeId: number;
    sensorTypeId: number;
    headerConnectorId: number;
    combineConnectorId: number;
    defaultHarnessChoiceId: number;
    name?: string;
    headerWidthMin: number;
    headerWidthMax: number;
    sensorMin: number;
    sensorMax: number;
    headerYearMin: number;
    headerYearMax: number;
    checkedByDefault?: boolean;
  }[];

  console.log(results);

  for (const question of results) {
    let controlToShowId: string;
    let parentQuestionId: string;
    if (question.controlToShowId) {
      controlToShowId = (
        (await dbQuery(
          `
					SELECT questionInternalId
					FROM GrainQuestionId
					WHERE internalId = ${question.controlToShowId}
				`,
        )) as { questionInternalId: string }[]
      )[0]!.questionInternalId;
      console.log(controlToShowId);
    }
    if (question.parentControlToShowId) {
      parentQuestionId = (
        (await dbQuery(
          `
					SELECT questionInternalId
					FROM GrainQuestionId
					WHERE internalId = ${question.parentControlToShowId}
				`,
        )) as { questionInternalId: string }[]
      )[0]!.questionInternalId;
      console.log(parentQuestionId);
    }
  }
};

const values = {
  combine_Make: 10,
  combine_Model: 228,
  combine_Connector: undefined,
  combine_Year: undefined,
  numRows: undefined,
  spacing: undefined,
  numSensors: 3,
  regionId: 1,
  snouts: 3,
  header_ExistingConnector: undefined,
  header_Year: undefined,
  header_Make: undefined,
  header_Model: undefined,
  headType: undefined,
  sensor: undefined,
  headerWidth: undefined,
};

const {
  combine_Make,
  combine_Model,
  combine_Connector,
  combine_Year,
  numRows,
  spacing,
  numSensors,
  regionId,
  snouts,
  header_ExistingConnector,
  header_Year,
  header_Make,
  header_Model,
  headType,
  sensor,
  headerWidth,
} = values;

const builder = async () => {
  const required = true;
  const tableType = `Grain`;

  const questionFilters = {
    Corn: {
      filterColumns: [
        { name: `regionId`, val: regionId, required },
        { name: `snoutsId`, val: snouts, required },
        { name: `headerConnectorId`, val: header_ExistingConnector, required },
        { name: `numberOfRows`, val: numRows },
        { name: `rowSpacing`, val: spacing },
        { name: `sensor`, val: numSensors },
        { name: `headerYear`, val: header_Year },
      ],
      joinTables: [
        "CombineMake",
        "CombineModel",
        "HeaderMake",
        "HeaderModel",
        "CombineConnector",
      ],
    },
    Grain: {
      filterColumns: [
        { name: `regionId`, val: regionId, required },
        { name: `headerConnectorId`, val: header_ExistingConnector, required },
        { name: `combineConnectorId`, val: combine_Connector, required },
        { name: `headTypeId`, val: headType, required },
        { name: `sensorTypeId`, val: sensor, required },
        { name: `headerWidth`, val: headerWidth },
        { name: `sensor`, val: numSensors },
        { name: `headerYear`, val: header_Year },
      ],
      joinTables: [`CombineMake`, `CombineModel`, `HeaderMake`, `HeaderModel`],
    },
    Truesight: {
      filterColumns: [
        { name: `regionId`, val: regionId, required },
        { name: `snoutId`, val: snouts, required },
        { name: `combineConnectorId`, val: combine_Connector, required },
        { name: `rowSpacing`, val: spacing },
        { name: `headerYear`, val: header_Year },
      ],
    },
    Conversion: {
      filterColumns: [
        { name: `regionId`, val: regionId, required },
        // This may be non-required
        { name: `combineConnectorId`, val: combine_Connector, required },
        { name: `headerYear`, val: header_Year },
      ],
    },
  }[tableType];

  const joinParts = [
    { table: `CombineMake`, alias: `cm`, value: combine_Make },
    { table: `CombineModel`, alias: `cmdl`, value: combine_Model },
    { table: `HeaderMake`, alias: `hm`, value: header_Make },
    { table: `HeaderModel`, alias: `hmdl`, value: header_Model },
    { table: `CombineConnector`, alias: `cc`, value: combine_Connector },
    { table: `HeaderConnector`, alias: `cc`, value: combine_Connector },
  ].filter(({ table }) => questionFilters.joinTables.includes(table));

  const { JOINs, joinValues } = {
    JOINs: joinParts.map(
      ({ table, alias }) =>
        `JOIN ${tableType}Question${table} ${alias} ON q.internalId = ${alias}.${tableType.toLowerCase()}QuestionId AND ${alias}.${camelize(table)}Id IN (?)`,
    ),
    joinValues: joinParts.flatMap(({ value }) => [
      [0, ...(value ? [value] : [])],
    ]),
  };

  const f = questionFilters.filterColumns
    .filter(({ val, required }) => required || val)
    .map(({ name, val, required }) => {
      return {
        WHERE: required
          ? `${name} IN (?)`
          : `${name}Min <= ? AND q.${name}Max >= ?`,
        value: required ? [[0, ...(val ? [val] : [])]] : [val, val],
      };
    });

  const { filters, values } = {
    filters: Object.entries(f).map(([, v]) => v.WHERE),
    values: Object.entries(f).flatMap(([, v]) => v.value),
  };

  console.log(joinValues);
  console.log(values);

  // console.log(
  // 	`
  // 	SELECT * FROM ?? q
  // 	${JOINs.join(` `)}
  // 	WHERE q.${filters.join(` AND q.`)}
  // `,
  // 	[`${tableType}Question`, ...joinValues, ...values]
  // );

  const results = await dbQuery(
    `
		SELECT * FROM ?? q
		${JOINs.join(` `)}
		WHERE q.${filters.join(` AND q.`)}
		AND q.parentControlToShowId = 0
	`,
    [`${tableType}Question`, ...joinValues, ...values],
  );

  console.log(results);
};

// await grainQuestion();
await builder();

process.exit();
