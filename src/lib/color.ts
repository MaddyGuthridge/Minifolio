/** Code for generating colors */
import Color from 'color';

/** Generate a random (hopefully) nice-looking color */
export function randomColor(): string {
  return Color.hsv(
    Math.random() * 360,
    Math.random() * 100,
    100,
  ).hex();
}
