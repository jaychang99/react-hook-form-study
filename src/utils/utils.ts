const FLATTENED_PROPERTY_DOT_NOTATION = '.';

export const addValueToObjectByNamePath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
  namePath: string[],
  value: unknown,
) => {
  const lastName = namePath[namePath.length - 1];
  let objToMerge = {
    [lastName]: value,
  };

  for (let i = namePath.length - 2; i >= 0; i--) {
    const name = namePath[i];

    objToMerge = {
      [name]: objToMerge,
    };
  }
  // @ts-expect-error temporary workaround
  deepMerge(object, objToMerge);
};

export const getValueFromObjectByNamePath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
  namePath: string[],
) => {
  let nextDepthObj = object;

  namePath.forEach((name) => {
    nextDepthObj = nextDepthObj?.[name];
  });

  if (!nextDepthObj) {
    console.warn(`No such data from ${namePath.join('.')}`);
  }

  return nextDepthObj;
};

export const flattenNamePath = (namePath: string[]): string => {
  return namePath.join(FLATTENED_PROPERTY_DOT_NOTATION);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unflattenObject = (flattenedObject: Record<string, any>) => {
  const unflattenedObject = {};

  Object.entries(flattenedObject).forEach(([key, value]) => {
    addValueToObjectByNamePath(
      unflattenedObject,
      key.split(FLATTENED_PROPERTY_DOT_NOTATION),
      value,
    );
  });

  return unflattenedObject;
};

type SerializableObject = {
  [key: number | string]: SerializableObject;
};
type DeepMerge = (
  destination: SerializableObject,
  source: SerializableObject,
) => void;

const deepMerge: DeepMerge = (destination, source) => {
  // const deepCopiedDestination = JSON.parse(JSON.stringify(destination));

  const callback: VisitPropertiesCallback = (namePath, value) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return;
    }

    let currentObject = destination;

    for (const name of namePath) {
      console.log('name_PATH', name);
      if (currentObject[name] === undefined) {
        currentObject[name] = {};
      }

      currentObject = currentObject[name];
    }

    console.log('for loop terminated');

    // @ts-expect-error temporary workaround
    currentObject[namePath[namePath.length - 1]] = value;
  };

  visitProperties(source, callback);

  // return deepCopiedDestination;
};

type NamePath = string[];
type VisitPropertiesCallback = (namePath: NamePath, value: unknown) => void;
type VisitProperties = (
  object: SerializableObject,
  callback: VisitPropertiesCallback,
  namePath?: NamePath,
) => void;

const visitProperties: VisitProperties = (
  object,
  callback,
  namePathSoFar = [],
) => {
  Object.entries(object).forEach(([key, value]) => {
    const namePath = [...namePathSoFar, key];
    callback(namePath, value);

    if (typeof value === 'object' && !Array.isArray(value)) {
      visitProperties(value, callback, namePath);
    }
  });
};
