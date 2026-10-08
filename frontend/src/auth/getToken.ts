import { getSession } from "./auth";

export async function getToken(): Promise<string> {
  const token = (await getSession()).tokens?.accessToken?.toString();
  if (!token) throw new Error("Not signed in.");
  return token;
}