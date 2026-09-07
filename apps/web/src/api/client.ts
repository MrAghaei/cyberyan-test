import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Something went wrong. Please try again.';
  }

  const axiosError = error as AxiosError<{ message?: string | string[] }>;

  if (!axiosError.response) {
    return 'Unable to reach the server. Check that the API is running.';
  }

  const message = axiosError.response.data?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  return `Request failed with status ${axiosError.response.status}.`;
}
