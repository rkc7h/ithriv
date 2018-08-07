/**
 *
 * @param hex RGB hex string (e.g., '#FFF', '#FFFFFF', 'FFF', or 'FFFFFF')
 * @param alpha Opacity number between 0.0 and 1.0
 */
export const hexColorToRGBA = function (hex: string, alpha = 1.0) {
  if (hex && (hex.length >= 3)) {

    // Remove leading hash character
    if (hex[0] === '#') {
      hex = hex.slice(1);
    }

    // Convert 3-character shortcut to 6-character equivalent
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Convert hex value to rgba equivalent
    let r: number, g: number, b: number;
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
};
