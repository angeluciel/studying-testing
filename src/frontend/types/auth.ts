export type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
};

export type ValidationResult = {
  ok: boolean;
  message: string | null;
};
