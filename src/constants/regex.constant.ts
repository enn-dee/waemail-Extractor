const RegexValidator = {
    PHONE_NUMBER: /^\+\d{1,3}\d{10}$/,
    EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
    PASSWORD_WITH_SPECIAL_CHAR: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,}$/,
    NAME: /^[a-zA-Z ]{2,30}$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    COORDINATES: /^-?\d{1,3}\.\d{1,10}$/,
  };
  export default RegexValidator;
  