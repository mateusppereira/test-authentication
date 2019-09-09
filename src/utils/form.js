import moment from "moment";

export const validateFormGroup = form => {
  // formulário inicia válido
  form.valid = true;
  form.submited = true;
  form.invalidFields = [];
  // percorro todos os grupos do formulário
  Object.keys(form.controls).map(controlKey => {
    let group = form.controls[controlKey];
    group.valid = true;
    group.invalid = false;
    // Verifico se ele é um campo mandatory
    if (group.required && !group.value) {
      form.valid = group.valid = false;
      group.invalid = true;
    }

    // Verifico se select
    if (group.isSelect && (!group.value || group.value === -1)) {
      form.valid = group.valid = false;
      group.invalid = true;
    }
    // verifico regra de tamanho minimo
    else if (
      group.minLength &&
      (!group.value || group.value.length < group.minLength)
    ) {
      form.valid = group.valid = false;
      group.invalid = true;
    }
    // verifico regra de tamanho maximo
    else if (
      group.maxLength &&
      (!group.value || group.value.length > group.maxLength)
    ) {
      form.valid = group.valid = false;
      group.invalid = true;
    } else if (
      group.minSlices &&
      group.value.split(" ").length < group.minSlices
    ) {
      form.valid = group.valid = false;
      group.invalid = true;
    }
    // verifico regra de cpf
    else if (group.isCPF && !validaCPF(group.value)) {
      form.valid = group.valid = false;
      group.invalid = true;
    }
    // verifico regra de email
    else if (
      group.isEmail &&
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        group.value
      )
    ) {
      form.valid = group.valid = false;
      group.invalid = true;
    } else if (group.minNumber && group.minNumber > group.value) {
      form.valid = group.valid = false;
      group.invalid = true;
    } else if (
      group.validDate &&
      group.required &&
      !moment(group.value).isValid()
    ) {
      form.valid = group.valid = false;
      group.invalid = true;
    }

    if (!group.valid) {
      form.invalidFields.push(group["alias"] || controlKey);
    }
    return true;
  });
  return form;
};

export const validaCPF = cpf => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf === "") return false;
  // Elimina CPFs invalidos conhecidos
  if (
    cpf.length !== 11 ||
    cpf === "00000000000" ||
    cpf === "11111111111" ||
    cpf === "22222222222" ||
    cpf === "33333333333" ||
    cpf === "44444444444" ||
    cpf === "55555555555" ||
    cpf === "66666666666" ||
    cpf === "77777777777" ||
    cpf === "88888888888" ||
    cpf === "99999999999"
  ) {
    return false;
  }

  let sumFirst = 0;
  let sumSecond = 0;
  for (let i = 0; i < 10; i++) {
    sumSecond += parseInt(cpf.charAt(i)) * (11 - i);
    if (i < 9) {
      sumFirst += parseInt(cpf.charAt(i)) * (10 - i);
    }
  }

  let sumFirstD = 11 - (sumFirst % 11);
  let sumSecondD = 11 - (sumSecond % 11);

  if (sumFirstD === 10 || sumFirstD === 11) {
    sumFirstD = 0;
  }
  if (sumSecondD === 10 || sumSecondD === 11) {
    sumSecondD = 0;
  }

  if (
    sumFirstD !== parseInt(cpf.charAt(9)) ||
    sumSecondD !== parseInt(cpf.charAt(10))
  ) {
    return false;
  }
  return true;
};

export const getRawValue = form => {
  // formulário inicia válido
  let rawValue = {};
  // percorro todos os grupos do formulário
  Object.keys(form.controls).map(controlKey => {
    return (rawValue[controlKey] = form.controls[controlKey].value);
  });

  return rawValue;
};
