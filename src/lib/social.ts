/**
 * Code for handling social stuff (eg Fediverse, GitHub, etc)
 */

/**
 * Given a fediverse handle, returns the corresponding URL.
 * @param fedi fediverse username
 * @returns URL for that fediverse account, or undefined if that handle is invalid.
 */
export function fediverseHandleToUrl(fedi: string): string | undefined {
  try {
    const [_, handle, domain] = fedi.split('@');
    if (handle === undefined || domain === undefined) {
      return undefined;
    }
    return `https://${domain}/@${handle}`;
  } catch {
    return undefined;
  }
}

/** Given a GitHub repo, fetches the star count. */
export async function getStarCountGitHub(repo: string): Promise<number | undefined> {
  if (repo.split('/').length !== 2) {
    // Not a repo (perhaps an organization) -- no star count
    return undefined;
  }
  // https://github.com/orgs/community/discussions/31111#discussioncomment-3492603
  const res = await fetch(`https://api.github.com/repos/${repo}`);
  const json = await res.json();
  return json.stargazers_count as number;
}
