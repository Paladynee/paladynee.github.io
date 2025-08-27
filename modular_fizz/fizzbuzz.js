const amount_element = document.querySelector("#amount");
const divisors_element = document.querySelector("#divisors");
const display_element = document.querySelector("#display");
const warn_element = document.querySelector("#warn");

let warned = false;

function submit() {
  const divisors = parseDivisors();
  if (divisors === null) return;
  const amount = parseAmount();
  if (amount === null) return;
  const output = fizzbuzz(amount, divisors);

  displayMessage(output);
}

function parseAmount() {
  const input = amount_element.value.trim();
  let errors = [];
  let num;
  while (true) {
    let previous_length = errors.length;

    if (input == "") {
      errors.push(`An integer amount is expected.`);
    }

    if (errors.length != previous_length) break;
    previous_length = errors.length;

    num = parseInt(input);

    if (Number.isNaN(num)) {
      errors.push(`Amount "${input}" is not a number.`);
    } else if (num <= 0) {
      errors.push(`Amount "${input}" must not be smaller than 1.`);
    } else if (num > 2147483647) {
      errors.push(`Amount "${input}" must not exceed 2147483647.`);
    }
    break;
  }
  if (errors.length) {
    errorMessage(
      "Could not parse amount due to:\n    " + errors.join("\n    ")
    );
    return null;
  } else {
    if (num > 100000 && !warned) {
      warned = true;
      warn.innerHTML =
        "That amount is quite big... Are you sure? (hit Submit again to proceed)";
      return null;
    } else {
      warned = false;
      warn.innerHTML = "";
      return num;
    }
  }
}

function parseDivisors() {
  const input = divisors_element.value;
  let table = [];
  let errors = [];
  for (let entry of input.trim().split(/ +/)) {
    if (entry === "") {
      errors.push(`At least 1 entry of format "num=text" is required.`);
      continue;
    }
    let [lhs, rhs, remaining] = entry.split("=");
    let previous_length = errors.length;
    if (remaining !== undefined) {
      errors.push(`Confusing equals sign in entry "${entry}"`);
    } else if (rhs === undefined) {
      errors.push(`No equals sign in entry "${entry}"`);
    }

    if (errors.length != previous_length) continue;
    previous_length = errors.length;

    if (rhs === "" && lhs == "") {
      errors.push(`Lone equals sign in entry "${entry}"`);
    } else if (lhs === "") {
      errors.push(`Left-hand side must not be empty in entry "${entry}"`);
    } else if (rhs === "") {
      errors.push(`Right-hand side must not be empty in entry "${entry}"`);
    }

    if (errors.length != previous_length) continue;
    previous_length = errors.length;

    const num = parseInt(lhs);
    if (Number.isNaN(num)) {
      errors.push(`Left-hand side must be a number in entry "${entry}"`);
    }

    table.push([num, rhs]);
  }

  if (errors.length) {
    errorMessage(
      "Could not parse divisors due to:\n    " + errors.join("\n    ")
    );
    return null;
  } else {
    return table;
  }
}

function errorMessage(str) {
  display_element.innerHTML = `### Error\n${str}`;
}

function displayMessage(str) {
  display_element.innerHTML = `### Output:\n${str}`;
}

function fizzbuzz(amount, divisors) {
  let main_buffer = "";
  for (let i = 1; i <= amount; i++) {
    let aux_buffer = "";
    for (const [int, word] of divisors) {
      if (i % int == 0) {
        aux_buffer += word;
      }
    }
    if (aux_buffer === "") aux_buffer = i;
    main_buffer += aux_buffer + "\n";
  }

  return main_buffer;
}

function mystr(len) {
  let alphabet = ["2", "=", " ", "a"];
  let str = [];
  for (let i = 0; i < len; i++) {
    str.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return str.join("");
}
