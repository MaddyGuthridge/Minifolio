export const invalidIds = [
  // Add a '/' at the end or fetch will trim it
  { id: ' /', case: 'Purely whitespace' },
  { id: 'hello=world', case: 'Non alphanumeric characters: "="' },
  { id: 'hello_world', case: 'Non alphanumeric characters: "_"' },
  { id: '.hello', case: 'Leading dot' },
  { id: 'hello.', case: 'Trailing dot' },
  { id: ' hello', case: 'Leading whitespace' },
  // Add a '/' at the end or fetch will trim it
  { id: 'hello /', case: 'Trailing whitespace' },
  { id: '-hello', case: 'Leading dash' },
  { id: 'hello-', case: 'Trailing dash' },
  { id: 'Hello', case: 'Capital letters' },
  { id: '🙃', case: 'Emoji' },
  { id: 'Español', case: 'Foreign characters' },
];

export const validIds = [
  { id: 'hello', case: 'Basic' },
  { id: 'hello-world', case: 'Dashes' },
  { id: 'node.js', case: 'Dots in middle of string' },
];

export const invalidNames = [
  { name: '', case: 'Empty string' },
  { name: 'Hello\tWorld', case: 'Illegal whitespace characters' },
  { name: ' ', case: 'Purely whitespace' },
  { name: ' Hello World', case: 'Leading whitespace characters' },
  { name: 'Hello World ', case: 'Trailing whitespace characters' },
];

export const validNames = [
  { name: 'Hello World', case: 'Basic' },
  { name: 'OS/161', case: 'Slash' },
  { name: 'Wow! This is cool', case: 'Other punctuation' },
  { name: '🙃', case: 'Emoji' },
  { name: 'Español', case: 'Foreign characters' },
];

export const invalidColors = [
  { color: 'ABCDEF', case: 'Missing "#"' },
  { color: '#12345G', case: 'Invalid chars' },
  { color: '#12345', case: 'Incorrect length' },
]

export const validColors = [
  { color: '#ABCDEF', case: 'Uppercase' },
  { color: '#abcdef', case: 'Lowercase' },
  // { color: '#123', case: '3 chars' },
]

export const invalidUrls = [
  { url: 'example.com', case: 'Missing protocol' },
  { url: 'https//example.com', case: 'Invalid protocol syntax' },
  { url: 'ssh://example.com', case: 'Non-HTTP protocol' },
];

export const validUrls = [
  { url: 'http://example.com', case: 'HTTP protocol' },
  { url: 'https://example.com', case: 'HTTPS protocol' },
  { url: 'https://example.com/example', case: 'Non-root page' },
  { url: 'https://example.com/example?foo=bar', case: 'Query string' },
  { url: 'https://example.com/example#anchor', case: 'Fragment string' },
]
