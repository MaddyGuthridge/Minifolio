/**
 * Helper function for formatting template strings
 *
 * @param input input string
 * @param replacements replacement strings to apply
 */
export default function formatTemplate(
  input: string,
  replacements: Record<string, string>,
): string {
  for (const [matcher, replacement] of Object.entries(replacements)) {
    input = input.replaceAll(`{{${matcher}}}`, replacement);
  }
  return input.trimStart();
}
