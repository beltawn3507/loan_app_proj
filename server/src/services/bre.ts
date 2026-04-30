export const runBRE = (data: {
  dob: Date;
  monthlySalary: number;
  employmentType: string;
  pan: string;
}) => {
  const errors: string[] = [];

  const age =
    (new Date().getTime() - new Date(data.dob).getTime()) /
    (1000 * 60 * 60 * 24 * 365);

  if (age < 23 || age > 50) {
    errors.push("Age must be between 23 and 50");
  }

  if (data.monthlySalary < 25000) {
    errors.push("Salary must be at least 25000");
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(data.pan)) {
    errors.push("Invalid PAN format");
  }

  if (data.employmentType === "UNEMPLOYED") {
    errors.push("Applicant must be employed");
  }

  return {
    isEligible: errors.length === 0,
    errors,
  };
};