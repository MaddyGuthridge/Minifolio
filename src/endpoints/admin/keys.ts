import { apiFetch, json } from "$endpoints/fetch"

export default function keys(token: string | undefined) {
  const get = async () => {
    return json(apiFetch(
      'GET',
      '/api/admin/keys',
      token,
    )) as Promise<{ publicKey: string }>;
  };

  return {
    /** Returns the server's SSH public key */
    get,
  };
}
