import { isObject } from "util";

export const insertOrRemove = (refArray, prop, item) => {
  const array = [...refArray]; // CRIA ARRAY SEM REFERÊNCIA
  const arrayToCompare = array.map(x => x[prop]);
  if (arrayToCompare.indexOf(item[prop]) !== -1) {
    return array.filter(x => x[prop] !== item[prop]);
  }
  array.unshift(item);
  return array;
};

export const upsert = (refArray, prop, item) => {
  const array = [...refArray]; // CRIA ARRAY SEM REFERÊNCIA
  const arrayToCompare = array.map(x => x[prop]);
  if (arrayToCompare.indexOf(item[prop]) !== -1) {
    return array.map(x => {
      if (x[prop] === item[prop]) {
        return item;
      }
      return x;
    });
  }
  array.unshift(item);
  return array;
};

export const isInArray = (refArray, prop, item, prop2 = null) => {
  const array = [...refArray]; // CRIA ARRAY SEM REFERÊNCIA
  const arrayToCompare = array.map(x => x[prop]);
  if (arrayToCompare.indexOf(item[prop2 || prop]) !== -1) {
    return true;
  }
  return false;
};

export const deleteItem = (refArray, prop, newItem) => {
  const array = [...refArray]; // CRIA ARRAY SEM REFERÊNCIA
  try {
    return array.filter(item => item[prop] !== newItem[prop]);
  } catch (error) {
    return array;
  }
};

export const filterBy = (refArray, filter) => {
  const array = [...refArray];
  let filteredArray = [];
  array.map(object => {
    let isValid = true;
    let isFound = false;

    if (isObject(filter)) {
      for (let objectProperty in filter) {
        let i = 0;
        let valueOrigin = object;
        let valueFilter = filter[objectProperty].value || "";
        let prop = filter[objectProperty].property.split(".");
        let len = prop.length;
        while (i < len && valueOrigin) {
          valueOrigin = valueOrigin[prop[i]];
          i++;
        }

        if (
          valueFilter &&
          !(
            valueOrigin &&
            valueOrigin
              .toString()
              .toLowerCase()
              .indexOf(valueFilter.toLowerCase()) > -1
          )
        ) {
          isValid = false;
        }
      }
    } else {
      for (let objectProperty in object) {
        if (
          !filter ||
          (object[objectProperty] &&
            isObject(object[objectProperty]) &&
            JSON.stringify(object[objectProperty])
              .toLowerCase()
              .indexOf(filter.toLowerCase()) > -1)
        ) {
          isFound = true;
          break;
        } else if (
          object[objectProperty] &&
          !isObject(object[objectProperty]) &&
          object[objectProperty]
            .toString()
            .toLowerCase()
            .indexOf(filter.toLowerCase()) > -1
        ) {
          isFound = true;
          break;
        }
      }
    }

    if (isValid && ((!isObject(filter) && isFound) || isObject(filter))) {
      filteredArray.push(object);
    }
  });
  return filteredArray;
};

export const sort = (prop, arr, asc = true) => {
  prop = prop.split(".");
  let len = prop.length;

  arr.sort((a, b) => {
    let i = 0;
    while (i < len) {
      if (a !== -1) {
        a = a[prop[i]] || "";
      }
      if (b !== -1) {
        b = b[prop[i]] || "";
      }
      i++;
    }
    if ((asc && a < b) || (!asc && a > b)) {
      return -1;
    } else if ((asc && a > b) || (!asc && a < b)) {
      return 1;
    } else {
      return 0;
    }
  });
  return arr;
};

export const getPropValue = (obj, prop) => {
  const props = prop.split(".");
  let value = obj;
  for (let i = 0; i < props.length; i++) {
    value = value[props[i]];
  }
  return value;
};

export const isEqual = (item1 = {}, item2 = {}) => {
  const type1 = typeOf(item1);
  const type2 = typeOf(item2);
  // VERIFICA SE O TIPO DOS ITEMS ENVIADOS SÃO IGUAIS
  if (type1 !== type2) return false;

  // VERIFICA SE É objeto/array OU VALOR NORMAL (string, number, bool)
  if (type1 === "object") {
    if (!Array.isArray(item1) && !Array.isArray(item2)) {
      // SE NÃO FOR array CHAMA compareObjects
      return compareObjects(item1, item2);
    } else {
      const length1 = item1.length;
      const length2 = item2.length;
      // COMPARA SE TAMANHO DOS arrays SÃO IGUAIS
      if (length1 !== length2) return false;

      // CASO TAMANHO SEJA 0 RETORNA TRUE
      if (length1 === 0) return true;

      // ITERA NOS VALORES DO ARRAY1 PARA PROCURAR CADA ITEM NO ARRAY2
      for (let i = 0; i < item1.length; i++) {
        const value1 = item1[i];
        const type1_1 = typeOf(value1);

        // VERIFICA SE É objeto/array OU VALOR NORMAL (string, number, bool)
        if (type1_1 === "object") {
          // VERIFICA SE ALGUMA DAS PROPRIEDADES DO ARRAY 2 É IGUAL AO VALOR1
          let propFound = false;
          if (!Array.isArray(item1) && !Array.isArray(item2)) {
            for (let w = 0; w < item2.length; w++) {
              const value2 = item2[w];
              if (compareObjects(value1, value2)) {
                propFound = true;
              }
            }
          } else {
            for (let w = 0; w < item2.length; w++) {
              const value2 = item2[w];
              if (isEqual(value1, value2)) {
                propFound = true;
              }
            }
          }
          // SE NÃO ACHAR NO ARRAY2 UM VALOR IGUAL AO VALOR1 RETORNA FALSE
          if (!propFound) return false;
        } else {
          if (item2.indexOf(value1) < 0) return false;
        }
      }
      return true;
    }
  } else {
    return item1 === item2;
  }
};

const compareObjects = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  // const keys1 = obj1 === null ? [] : Object.keys(obj1);
  // const keys2 = obj2 === null ? [] : Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i];
    const value1 = obj1[key];
    const value2 = obj2[key];

    // VERIFICA SE KEY EXISTE NO OBJETO 2 E SE SÃO DO MESMO TIPO
    const type1 = value1 === null ? false : typeOf(value1);
    const type2 = value2 === null ? false : typeOf(value2);
    if (type1 !== type2) {
      return false;
    }

    if (Array.isArray(value1) && Array.isArray(value2)) {
      if (!isEqual(value1, value2)) {
        return false;
      }
    } else if (type1 === "object" && type2 === "object") {
      if (!compareObjects(value1, value2)) {
        return false;
      }
    } else {
      // VERIFICA SE PROPRIEDADES TEM MESMO VALOR
      if (obj1[key] !== obj2[key]) return false;
    }
  }
  return true;
};

const typeOf = val => {
  if (val === null) return null;

  return typeof val;
};
