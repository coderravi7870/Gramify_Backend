exports.validation = (required_fields, data) => {
  const error = {};
  for (let i of required_fields) {
    if (!data[i]) {
      error[i] = `${i} is required`;
      //   error.push(`${i} is required`);
    }
  }
  //   console.log(Object.keys(error));

  return error;
};

exports.validUser = (username) => {
  const rejex = /^[^\d]+$/;
  return rejex.test(username);
};

exports.validEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return regex.test(email);
};
